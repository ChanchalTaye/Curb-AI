"""LLM client abstraction — Groq (default), OpenAI, and Ollama support.

Groq uses the OpenAI-compatible API interface, so switching between
Groq and OpenAI requires only changing the base_url and api_key.
"""

import os
from langchain_openai import ChatOpenAI


def get_llm_client():
    """Return a LangChain ChatModel based on the LLM_PROVIDER env var.

    Groq API uses the same OpenAI client interface — just a different
    base URL and API key. This means zero code changes to switch providers.
    """
    provider = os.getenv("LLM_PROVIDER", "groq").lower()

    if provider == "groq":
        return ChatOpenAI(
            model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
            api_key=os.getenv("GROQ_API_KEY"),
            base_url="https://api.groq.com/openai/v1",
            temperature=0.1,
            max_tokens=1500,
        )

    if provider == "openai":
        return ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o"),
            api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0.1,
            max_tokens=1500,
        )

    if provider == "ollama":
        return ChatOpenAI(
            model=os.getenv("OLLAMA_MODEL", "qwen2.5:14b"),
            api_key="ollama",  # Ollama doesn't need a real key
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1"),
            temperature=0.1,
        )

    raise ValueError(f"Unknown LLM_PROVIDER: {provider}. Use 'groq', 'openai', or 'ollama'.")
