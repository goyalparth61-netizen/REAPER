import os
import json
import httpx
from typing import Dict, Any, Optional

from app.core.config import settings
from app.core.logging import logger


class GeminiService:
    """
    Client for Google Gemini REST API.
    Provides structured AI reasoning and code generation for REAPER agents.
    """
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.primary_model = settings.AI_MODEL or "gemini-3.5-flash"
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    def generate_content(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        json_output: bool = False,
        timeout: float = 30.0
    ) -> Optional[str]:
        if not self.is_available():
            logger.warning("[GEMINI] Gemini API key not configured. Using deterministic engine logic.")
            return None

        # Build payload
        contents = [{"parts": [{"text": prompt}]}]
        payload: Dict[str, Any] = {"contents": contents}

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        generation_config: Dict[str, Any] = {
            "temperature": 0.2,
            "maxOutputTokens": 4096
        }
        if json_output:
            generation_config["responseMimeType"] = "application/json"

        payload["generationConfig"] = generation_config

        url = f"{self.base_url}/{self.primary_model}:generateContent?key={self.api_key}"

        try:
            with httpx.Client(timeout=timeout) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "").strip()
                elif res.status_code == 404:
                    # Model fallback
                    logger.warning(f"[GEMINI] Model {self.primary_model} returned 404. Trying fallback model gemini-3.8-flash...")
                    fallback_url = f"{self.base_url}/gemini-3.8-flash:generateContent?key={self.api_key}"
                    fallback_res = client.post(fallback_url, json=payload)
                    if fallback_res.status_code == 200:
                        data = fallback_res.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts:
                                return parts[0].get("text", "").strip()
                    logger.error(f"[GEMINI] Fallback API error HTTP {fallback_res.status_code}: {fallback_res.text[:200]}")
                else:
                    logger.error(f"[GEMINI] API error HTTP {res.status_code}: {res.text[:200]}")
        except Exception as e:
            logger.error(f"[GEMINI] Request exception: {type(e).__name__}: {e}")

        return None

    def generate_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        timeout: float = 30.0
    ) -> Optional[Dict[str, Any]]:
        text = self.generate_content(
            prompt=prompt,
            system_instruction=system_instruction,
            json_output=True,
            timeout=timeout
        )
        if not text:
            return None
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Strip potential markdown formatting if returned
            clean = text.strip()
            if clean.startswith("```json"):
                clean = clean[7:]
            if clean.startswith("```"):
                clean = clean[3:]
            if clean.endswith("```"):
                clean = clean[:-3]
            try:
                return json.loads(clean.strip())
            except Exception:
                logger.warning(f"[GEMINI] Failed to parse JSON response: {text[:200]}")
                return None


gemini_service = GeminiService()
