from fastapi import FastAPI

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field

from qna import answer_question
from explanation_module import explain_topic
from quiz_module import generate_quiz
from summary_module import summarize_text
from learning_path import get_learning_recommendations


load_dotenv()


BASE_DIR = Path(
    __file__
).resolve().parent


app = FastAPI(
    title="EduGenie API",
    description="Google Gemini Powered Learning Assistant",
    version="1.0.0",
)


app.mount(
    "/static",
    StaticFiles(
        directory=BASE_DIR / "static"
    ),
    name="static",
)


templates = Jinja2Templates(
    directory=str(
        BASE_DIR / "templates"
    )
)


# -----------------------------
# Request Models
# -----------------------------

class TextRequest(BaseModel):

    text: str = Field(
        ...,
        min_length=1,
        max_length=30000,
    )


class QuestionRequest(BaseModel):

    question: str = Field(
        ...,
        min_length=1,
        max_length=10000,
    )


class LearningRequest(BaseModel):

    topic: str = Field(
        ...,
        min_length=1,
        max_length=5000,
    )

    level: str = Field(
        default="beginner",
        max_length=50,
    )


# -----------------------------
# Frontend
# -----------------------------

@app.get(
    "/",
    response_class=HTMLResponse,
)
async def home(
    request: Request,
):

    return templates.TemplateResponse(
        "index.html",
        {
            "request": request
        },
    )


# -----------------------------
# Health Check
# -----------------------------

@app.get("/health")
async def health():

    return {
        "status": "ok",
        "app": "EduGenie",
    }


# -----------------------------
# Q&A
# -----------------------------

@app.post("/qa")
async def qa(
    payload: QuestionRequest,
):

    answer = answer_question(
        payload.question
    )

    return {
        "answer": answer
    }


# -----------------------------
# Explanation
# -----------------------------

@app.post("/explain")
async def explain(
    payload: TextRequest,
):

    explanation = explain_topic(
        payload.text
    )

    return {
        "explanation": explanation
    }


# -----------------------------
# Quiz
# -----------------------------

@app.post("/quiz")
async def quiz(
    payload: TextRequest,
):

    quiz_data = generate_quiz(
        payload.text
    )

    return {
        "quiz": quiz_data
    }


# -----------------------------
# Summary
# -----------------------------

@app.post("/summarize")
async def summarize(
    payload: TextRequest,
):

    summary = summarize_text(
        payload.text
    )

    return {
        "summary": summary
    }


# -----------------------------
# Learning Recommendations
# -----------------------------

@app.post(
    "/learn/recommendations"
)
async def learning_recommendations(
    payload: LearningRequest,
):

    recommendations = (
        get_learning_recommendations(
            payload.topic,
            payload.level,
        )
    )

    return {
        "recommendations": recommendations
    }


# -----------------------------
# Run directly
# -----------------------------

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )