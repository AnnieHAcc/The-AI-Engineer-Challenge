from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS so the frontend can talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

DEFAULT_SYSTEM_PROMPT = "You are a supportive mental coach."


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    system_prompt: str | None = None
    history: list[ChatMessage] | None = None


@app.get("/")
def root():
    return {"status": "ok"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/chat")
def chat(request: ChatRequest):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured")

    try:
        system_prompt = request.system_prompt or DEFAULT_SYSTEM_PROMPT
        messages: list[dict[str, str]] = [
            {"role": "system", "content": system_prompt}
        ]

        if request.history:
            for msg in request.history:
                if msg.role in ("user", "assistant"):
                    messages.append({"role": msg.role, "content": msg.content})

        messages.append({"role": "user", "content": request.message})

        response = client.chat.completions.create(
            model="gpt-5",
            messages=messages,
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calling OpenAI API: {str(e)}")
