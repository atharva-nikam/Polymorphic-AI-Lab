# server/main.py
import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
API_KEY = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
MODEL = os.getenv("OPENROUTER_MODEL", "nvidia/nemotron-3-ultra-550b-a55b:free")

app = FastAPI()
client = OpenAI(
    api_key=API_KEY,
    base_url=OPENROUTER_BASE_URL,
    default_headers={
        "HTTP-Referer": os.getenv("OPENROUTER_SITE_URL", "http://localhost:5173"),
        "X-Title": os.getenv("OPENROUTER_APP_NAME", "AI Polymorphic Lab"),
    },
)

# Enable CORS for the React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SCHEMAS (The Contract) ---
class VariableConfig(BaseModel):
    name: str
    var_id: str
    min: float
    max: float
    default: float
    unit: str

class SimulationSchema(BaseModel):
    title: str
    variables: List[VariableConfig]
    formula_expression: str
    output_unit: str

class ChatRequest(BaseModel):
    message: str

# --- TOOL DEFINITIONS ---
tools = [
    {
        "type": "function",
        "function": {
            "name": "spawn_simulation_lab",
            "description": "Create an interactive lab where users can adjust variables to see real-time changes in a formula (Physics, Math, Finance).",
            "parameters": SimulationSchema.model_json_schema()
        }
    }
]

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    print(f"User asking: {req.message}")

    if not API_KEY or API_KEY.startswith("sk-..."):
        raise HTTPException(
            status_code=500,
            detail="No API key configured. Set OPENROUTER_API_KEY in server/.env",
        )

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are a visual learning engine. If a user asks about a mathematical/physics relationship, DO NOT explain with text. Call 'spawn_simulation_lab'."},
                {"role": "user", "content": req.message}
            ],
            tools=tools,
            tool_choice="auto"
        )

        msg = response.choices[0].message

        # IF the AI wants to use a tool, return that specific instruction
        if msg.tool_calls:
            tool_call = msg.tool_calls[0]
            if tool_call.function.name == "spawn_simulation_lab":
                args = json.loads(tool_call.function.arguments)
                return {
                    "type": "SIMULATION",
                    "payload": args
                }
        
        # Else, standard text
        return {"type": "TEXT", "payload": msg.content}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
