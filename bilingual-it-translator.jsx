import React, { useState, useEffect } from "react";

const FONT_LINK_ID = "plex-font-link-2";

function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);
}

const EXAMPLES = [
  "Restart your computer, then try logging in again with your network password.",
  "Your VPN certificate has expired. Please contact IT to have it renewed before your next shift.",
  "Unplug the printer, wait 10 seconds, then plug it back in and try printing again.",
];

function buildPrompt(text, simplify) {
  return `Translate the following IT support instruction into clear, professional Spanish suitable for hospital or enterprise staff who are non-technical. ${
    simplify
      ? "Also simplify the English into plain, jargon-free language before translating, so someone with no IT background can follow it."
      : "Keep the English as-is; just translate it accurately."
  }

Respond ONLY in this exact format, no preamble, no markdown:
ENGLISH: <the English version, simplified if requested, otherwise unchanged>
SPANISH: <the Spanish translation>

Text: """${text}"""`;
}

function parseResponse(raw) {
  const enMatch = raw.match(/ENGLISH:\s*([\s\S]*?)\nSPANISH:/i);
  const esMatch = raw.match(/SPANISH:\s*([\s\S]*)/i);
  return {
    english: enMatch ? enMatch[1].trim() : "",
    spanish: esMatch ? esMatch[1].trim() : raw.trim(),
  };
}

export default function BilingualITTranslator() {
  useFonts();
  const [input, setInput] = useState("");
  const [simplify, setSimplify] = useState(true);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function translate() {
    const text = input.trim();
    if (!text || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: buildPrompt(text, simplify) }],
        }),
      });
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      const raw = data.content
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("\n")
        .trim();
      setResult(parseResponse(raw));
    } catch (e) {
      setError("Something went wrong reaching the assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
        background: "#F5F6F8",
        minHeight: "100vh",
        padding: "32px 16px",
        display: "flex",
        justifyContent: "center",
        color: "#20242C",
      }}
    >
      <div style={{ width: "100%", maxWidth: 720 }}>
        {/* Header */}
        <div
          style={{
            background: "#1F3864",
            borderRadius: "10px 10px 0 0",
            padding: "18px 20px",
          }}
        >
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              color: "#B7C4E0",
              letterSpacing: "0.05em",
            }}
          >
            BILINGUAL SUPPORT TOOL
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, color: "#FFFFFF", marginTop: 2 }}>
            IT Instruction Translator — English ↔ Español
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #DDE1E8",
            borderTop: "none",
            borderRadius: "0 0 10px 10px",
            padding: 22,
          }}
        >
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#4B5563",
              display: "block",
              marginBottom: 6,
            }}
          >
            Enter the instruction or notice you need translated
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            placeholder="e.g. Restart your computer, then log in again with your network password."
            style={{
              width: "100%",
              border: "1px solid #DDE1E8",
              borderRadius: 8,
              padding: "10px 12px",
              fontFamily: "inherit",
              fontSize: 14.5,
              outline: "none",
              color: "#20242C",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setInput(ex)}
                style={{
                  background: "#F0F2F5",
                  border: "1px solid #DDE1E8",
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: 12.5,
                  color: "#4B5563",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {ex.length > 42 ? ex.slice(0, 42) + "…" : ex}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 16,
            }}
          >
            <button
              role="switch"
              aria-checked={simplify}
              onClick={() => setSimplify((s) => !s)}
              style={{
                width: 40,
                height: 22,
                borderRadius: 999,
                border: "none",
                background: simplify ? "#1F7A5C" : "#CBD2DC",
                position: "relative",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  left: simplify ? 20 : 2,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  transition: "left 0.15s",
                }}
              />
            </button>
            <span style={{ fontSize: 13.5, color: "#4B5563" }}>
              Also simplify into plain, jargon-free language
            </span>
          </div>

          <button
            onClick={translate}
            disabled={loading || !input.trim()}
            style={{
              marginTop: 16,
              background: loading || !input.trim() ? "#AAB4C6" : "#1F3864",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading || !input.trim() ? "default" : "pointer",
            }}
          >
            {loading ? "Translating…" : "Translate"}
          </button>

          {error && (
            <div style={{ color: "#B3452C", fontSize: 13.5, marginTop: 12 }}>
              {error}
            </div>
          )}

          {result && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginTop: 20,
              }}
            >
              <div
                style={{
                  border: "1px solid #DDE1E8",
                  borderRadius: 8,
                  padding: 14,
                  background: "#F9FAFB",
                }}
              >
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    color: "#8A93A3",
                    marginBottom: 6,
                    letterSpacing: "0.05em",
                  }}
                >
                  ENGLISH
                </div>
                <div style={{ fontSize: 14.5, lineHeight: 1.5 }}>{result.english}</div>
              </div>
              <div
                style={{
                  border: "1px solid #DDE1E8",
                  borderRadius: 8,
                  padding: 14,
                  background: "#F9FAFB",
                }}
              >
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    color: "#8A93A3",
                    marginBottom: 6,
                    letterSpacing: "0.05em",
                  }}
                >
                  ESPAÑOL
                </div>
                <div style={{ fontSize: 14.5, lineHeight: 1.5 }}>{result.spanish}</div>
              </div>
            </div>
          )}
        </div>

        <div style={{ fontSize: 12.5, color: "#8A93A3", marginTop: 10 }}>
          Prototype tool for bilingual IT/hospital support communication — for demonstration purposes.
        </div>
      </div>
    </div>
  );
}
