"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { keyframes } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { alpha } from "@mui/material/styles";
import confetti from "canvas-confetti";
import queenImage from "../public/queen-1-transparent.png";

const slowBlink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const spinIn = keyframes`
  0% { transform: scale(0.3) rotate(-180deg); opacity: 0; }
  60% { transform: scale(1.1) rotate(12deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
`;

type Call = { letter: string; number: number };

const ROWS: { letter: string; start: number }[] = [
  { letter: "B", start: 1 },
  { letter: "I", start: 16 },
  { letter: "N", start: 31 },
  { letter: "G", start: 46 },
  { letter: "O", start: 61 },
];

function letterForNumber(n: number): string {
  if (n <= 15) return "B";
  if (n <= 30) return "I";
  if (n <= 45) return "N";
  if (n <= 60) return "G";
  return "O";
}

const PINK = "#ec4899";
const PINK_DARK = "#9d174d";
const GOLD = "#f5b91d";

export default function Home() {
  const [started, setStarted] = useState(false);
  const [remaining, setRemaining] = useState<number[]>([]);
  const [called, setCalled] = useState<Call[]>([]);
  const [current, setCurrent] = useState<Call | null>(null);
  const [comment, setComment] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);
  const ballRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicBufferRef = useRef<AudioBuffer | null>(null);
  const musicSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const chimeBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = muted ? 0 : 1;
    gain.connect(ctx.destination);
    audioCtxRef.current = ctx;
    musicGainRef.current = gain;

    fetch("/bgm.wav")
      .then((res) => res.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((buffer) => {
        musicBufferRef.current = buffer;
      })
      .catch(() => {});

    fetch("/chime.wav")
      .then((res) => res.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((buffer) => {
        chimeBufferRef.current = buffer;
      })
      .catch(() => {});

    return () => {
      void ctx.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (musicGainRef.current) {
      musicGainRef.current.gain.value = muted ? 0 : 1;
    }
  }, [muted]);

  function playMusic() {
    const ctx = audioCtxRef.current;
    const buffer = musicBufferRef.current;
    const gain = musicGainRef.current;
    if (!ctx || !buffer || !gain) return;

    if (ctx.state === "suspended") void ctx.resume();

    musicSourceRef.current?.stop();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    source.start();
    musicSourceRef.current = source;
  }

  function stopMusic() {
    musicSourceRef.current?.stop();
    musicSourceRef.current = null;
  }

  function playChime() {
    const ctx = audioCtxRef.current;
    const buffer = chimeBufferRef.current;
    const gain = musicGainRef.current;
    if (!ctx || !buffer || !gain) return;

    if (ctx.state === "suspended") void ctx.resume();

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);
    source.start();
  }

  const calledSet = useMemo(
    () => new Set(called.map((c) => c.number)),
    [called],
  );

  const recentCalls = called.slice(0, -1).reverse();

  function startGame() {
    const pool = Array.from({ length: 75 }, (_, i) => i + 1);
    setCalled([]);
    setCurrent(null);
    setComment("");
    setError("");
    setStarted(true);
    playMusic();
    void drawNumber(pool);
  }

  function resetGame() {
    setRemaining([]);
    setCalled([]);
    setCurrent(null);
    setComment("");
    setError("");
    setStarted(false);
    stopMusic();
  }

  function callNext() {
    void drawNumber(remaining);
  }

  function fireConfetti() {
    const rect = ballRef.current?.getBoundingClientRect();
    const origin = rect
      ? {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        }
      : { x: 0.5, y: 0.4 };

    confetti({
      particleCount: 90,
      spread: 70,
      startVelocity: 32,
      gravity: 0.9,
      ticks: 200,
      origin,
      colors: [PINK, GOLD, "#ffffff"],
      scalar: 0.9,
    });
  }

  async function drawNumber(pool: number[]) {
    if (pool.length === 0) return;

    const idx = Math.floor(Math.random() * pool.length);
    const number = pool[idx];
    const letter = letterForNumber(number);

    setRemaining(pool.filter((_, i) => i !== idx));
    setCurrent({ letter, number });
    setCalled((prev) => [...prev, { letter, number }]);
    fireConfetti();
    playChime();
    setError("");
    setLoadingComment(true);

    try {
      const res = await fetch("/api/call-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letter, number }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }

      setComment(data.comment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoadingComment(false);
    }
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: "#050507",
        color: "#f5f5f7",
        minHeight: 0,
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          position: "relative",
          width: { xs: "100%", md: 280 },
          flexShrink: 0,
          bgcolor: "#111116",
          borderRight: { md: `1px solid ${alpha("#fff", 0.08)}` },
          borderBottom: { xs: `1px solid ${alpha("#fff", 0.08)}`, md: "none" },
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <IconButton
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute music" : "Mute music"}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: alpha("#fff", 0.5),
            "&:hover": { color: PINK },
          }}
        >
          {muted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
        </IconButton>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            sx={{
              position: "relative",
              width: 160,
              height: 160,
              borderRadius: "50%",
              overflow: "hidden",
              border: `3px solid ${PINK}`,
              boxShadow: `0 0 24px ${alpha(PINK, 0.5)}`,
            }}
          >
            <Image
              src={queenImage}
              alt="Drag queen mascot"
              fill
              sizes="160px"
              style={{ objectFit: "cover", objectPosition: "center 20%" }}
              priority
            />
          </Box>
        </Box>

        <Typography
          sx={{
            fontFamily: "var(--font-fredoka)",
            fontWeight: 700,
            fontSize: "1.2rem",
            color: PINK,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.75,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          <AutoAwesomeIcon sx={{ color: GOLD, fontSize: "1.3rem" }} />
          Drag Queen Bingo
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <DigitalDisplay label="Calls" value={called.length} />
          <DigitalDisplay label="Remaining" value={75 - called.length} />
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <Typography
            variant="caption"
            sx={{ color: alpha("#fff", 0.5), letterSpacing: 1.5, fontWeight: 700 }}
          >
            PREVIOUS CALLS
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mt: 1,
              flexWrap: "wrap",
              alignContent: "flex-start",
              overflowY: "auto",
              flex: 1,
              minHeight: 0,
            }}
          >
            {recentCalls.length === 0 && (
              <Typography sx={{ color: alpha("#fff", 0.3) }}>—</Typography>
            )}
            {recentCalls.map((c, i) => (
              <Ball key={i} letter={c.letter} number={c.number} size={40} />
            ))}
          </Box>
        </Box>

        <Button
          onClick={started ? callNext : startGame}
          disabled={started && (loadingComment || remaining.length === 0)}
          variant="contained"
          size="large"
          sx={{
            bgcolor: PINK,
            "&:hover": { bgcolor: "#db2777" },
            fontWeight: 700,
            py: 1.5,
          }}
        >
          {!started
            ? "Start Game"
            : remaining.length === 0
              ? "All numbers called!"
              : "Next Number"}
        </Button>

        <Button
          onClick={resetGame}
          disabled={!started}
          variant="outlined"
          sx={{
            color: alpha("#fff", 0.7),
            borderColor: alpha("#fff", 0.2),
            "&:hover": { borderColor: alpha("#fff", 0.4) },
          }}
        >
          Reset Board
        </Button>
      </Box>

      {/* Board */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 3, gap: 3, minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 3,
            borderBottom: `1px solid ${alpha("#fff", 0.08)}`,
            pb: 3,
          }}
        >
          <Box
            ref={ballRef}
            sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}
          >
            <Ball
              key={current?.number ?? "empty"}
              letter={current?.letter}
              number={current?.number}
              size={160}
              highlight
            />
            <Typography
              variant="subtitle2"
              sx={{ color: alpha("#fff", 0.6), letterSpacing: 1.5, fontWeight: 700 }}
            >
              CURRENT CALL
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: "1.1rem",
                fontStyle: "italic",
                color: alpha("#fff", loadingComment ? 0.35 : 0.85),
                height: "3.25rem",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                transition: "color 0.2s ease",
              }}
            >
              {!started ? "" : comment || "Ready when you are, darling."}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {error}
              </Alert>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "auto repeat(15, 1fr)",
            gridAutoRows: "1fr",
            gap: "2px",
            flex: 1,
          }}
        >
          {ROWS.map((row) => (
            <Box key={row.letter} sx={{ display: "contents" }}>
              <Box
                sx={{
                  bgcolor: PINK_DARK,
                  color: alpha("#fff", 0.9),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: { xs: "1.25rem", sm: "1.75rem" },
                  px: 2,
                  borderRadius: 1,
                }}
              >
                {row.letter}
              </Box>
              {Array.from({ length: 15 }, (_, i) => {
                const n = row.start + i;
                const isCalled = calledSet.has(n);
                const isCurrent = current?.number === n;
                return (
                  <Box
                    key={n}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: { xs: "0.85rem", sm: "1.1rem" },
                      fontWeight: isCalled ? 700 : 400,
                      color: isCalled ? "#fff" : alpha("#fff", 0.18),
                      ...(isCurrent && {
                        color: GOLD,
                        animation: `${slowBlink} 2.5s ease-in-out infinite`,
                      }),
                    }}
                  >
                    {n}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function DigitalDisplay({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <Box sx={{ flex: 1, textAlign: "center" }}>
      <Box
        sx={{
          bgcolor: "#000",
          border: `1px solid ${alpha("#fff", 0.15)}`,
          borderRadius: 1,
          py: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "1.75rem",
            fontWeight: 700,
            color: PINK,
          }}
        >
          {value}
        </Typography>
      </Box>
      <Typography
        variant="caption"
        sx={{ color: alpha("#fff", 0.5), letterSpacing: 1 }}
      >
        {label.toUpperCase()}
      </Typography>
    </Box>
  );
}

function Ball({
  letter,
  number,
  size,
  highlight,
}: {
  letter?: string;
  number?: number;
  size: number;
  highlight?: boolean;
}) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: highlight ? GOLD : alpha(PINK, 0.15),
        border: `2px solid ${highlight ? "#fff" : PINK}`,
        color: highlight ? "#3a2400" : PINK,
        boxShadow: highlight ? `0 0 24px ${alpha(GOLD, 0.6)}` : "none",
        flexShrink: 0,
        ...(highlight &&
          number !== undefined && {
            animation: `${spinIn} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)`,
          }),
      }}
    >
      {number !== undefined ? (
        <>
          <Typography
            sx={{
              fontFamily: "var(--font-fredoka)",
              fontWeight: 600,
              fontSize: size * 0.22,
              lineHeight: 1,
            }}
          >
            {letter}
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-fredoka)",
              fontWeight: 700,
              fontSize: size * 0.32,
              lineHeight: 1.1,
            }}
          >
            {number}
          </Typography>
        </>
      ) : (
        <Typography sx={{ fontWeight: 700, fontSize: size * 0.28 }}>–</Typography>
      )}
    </Box>
  );
}
