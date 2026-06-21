"use client";

import { motion } from "framer-motion";
import { Gift, MessageCircle, RotateCw, ShieldCheck, TicketCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useState } from "react";
import type { Prize, Redemption } from "@/lib/types";
import { isBrazilianPhone, isBrazilianPlate, sanitizeText } from "@/lib/validators";
import { Button, Card, FieldLabel, Input, Pill } from "./ui";

const SPIN_DURATION_SECONDS = 10;
const SPIN_DURATION_MS = SPIN_DURATION_SECONDS * 1000;
const wheelStuds = Array.from({ length: 18 }, (_, index) => index);

const terms = [
  "Aceito os Termos de Uso.",
  "Aceito a Politica de Privacidade.",
  "Aceito o Regulamento da Campanha.",
  "Autorizo contato por WhatsApp.",
  "Confirmo que meus dados sao verdadeiros."
];

interface SavedDrawResult {
  prize: Prize;
  redemption: Redemption;
  rotation: number;
}

export function RouletteExperience({ vipGroupUrl, googleMapsUrl }: { vipGroupUrl: string; googleMapsUrl: string }) {
  const [accepted, setAccepted] = useState<string[]>([]);
  const [form, setForm] = useState({ nome: "", telefone: "", whatsapp: "", placa: "", marca: "", modelo: "", km: "" });
  const [confirmed, setConfirmed] = useState(false);
  const [joinedGroup, setJoinedGroup] = useState(false);
  const [result, setResult] = useState<SavedDrawResult | null>(null);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);

  const canContinue = useMemo(() => {
    return (
      form.nome.trim().length > 3 &&
      isBrazilianPhone(form.telefone) &&
      isBrazilianPhone(form.whatsapp) &&
      isBrazilianPlate(form.placa) &&
      form.marca.trim().length > 1 &&
      form.modelo.trim().length > 1 &&
      Number(form.km) > 0 &&
      accepted.length === terms.length
    );
  }, [accepted.length, form]);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: sanitizeText(value) }));
  }

  function confirmData() {
    if (!canContinue) {
      setError("Preencha os campos obrigatorios, aceite os termos e confira telefone e placa.");
      return;
    }
    setError("");
    setConfirmed(true);
  }

  async function spin() {
    if (isSpinning) {
      return;
    }

    setError("");
    setIsSpinning(true);

    try {
      const response = await fetch("/api/participate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          acceptedTerms: accepted,
          joinedVipGroup: joinedGroup
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Nao foi possivel registrar sua participacao.");
        setIsSpinning(false);
        return;
      }

      setRotation((current) => current + 3600 + data.rotation);
      window.setTimeout(() => {
        setResult(data);
        setIsSpinning(false);
      }, SPIN_DURATION_MS);
    } catch {
      setError("Falha de conexao. Tente novamente.");
      setIsSpinning(false);
    }
  }

  if (result) {
    const qrPayload = `DAC:${result.redemption.codigo}:${result.redemption.placa}:${result.prize.nome}`;
    return (
      <Card className="border-brand-red p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Pill tone="red">Parabens</Pill>
          <Pill tone="dark">{result.redemption.codigo}</Pill>
        </div>
        <h2 className="text-2xl font-black">Voce ganhou: {result.prize.nome}</h2>
        <p className="mt-2 text-sm text-zinc-600">{result.prize.descricao}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_160px]">
          <div className="rounded-lg bg-zinc-50 p-4 text-sm">
            <p><strong>Cliente:</strong> {form.nome}</p>
            <p><strong>Placa:</strong> {result.redemption.placa}</p>
            <p><strong>Validade:</strong> {result.redemption.validade}</p>
            <p><strong>Status:</strong> pendente</p>
            <p className="mt-3 text-xs text-zinc-500">Sem registro no sistema, codigo e QR Code, o premio nao e valido.</p>
          </div>
          <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-3">
            <QRCodeSVG value={qrPayload} size={132} />
          </div>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-4">
          <a href={`/resgate/${result.redemption.codigo}`} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white shadow-glow">Resgatar premio</a>
          <Button variant="secondary">Chamar no WhatsApp</Button>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-950 transition hover:border-brand-red active:scale-[0.98]"
          >
            Como chegar
          </a>
          <Button variant="dark">Indicar amigo</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <TicketCheck className="text-brand-red" />
          <h2 className="text-xl font-black">Cadastro para participar</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel required>Nome completo</FieldLabel>
            <Input value={form.nome} onChange={(event) => update("nome", event.target.value)} placeholder="Seu nome" />
          </div>
          <div>
            <FieldLabel required>Telefone</FieldLabel>
            <Input value={form.telefone} onChange={(event) => update("telefone", event.target.value)} placeholder="(12) 99999-9999" />
          </div>
          <div>
            <FieldLabel required>WhatsApp</FieldLabel>
            <Input value={form.whatsapp} onChange={(event) => update("whatsapp", event.target.value)} placeholder="(12) 99999-9999" />
          </div>
          <div>
            <FieldLabel required>Placa</FieldLabel>
            <Input value={form.placa} onChange={(event) => update("placa", event.target.value.toUpperCase())} placeholder="ABC1D23" />
          </div>
          <div>
            <FieldLabel required>Marca</FieldLabel>
            <Input value={form.marca} onChange={(event) => update("marca", event.target.value)} placeholder="Toyota" />
          </div>
          <div>
            <FieldLabel required>Modelo</FieldLabel>
            <Input value={form.modelo} onChange={(event) => update("modelo", event.target.value)} placeholder="Corolla" />
          </div>
          <div>
            <FieldLabel required>KM atual</FieldLabel>
            <Input type="number" value={form.km} onChange={(event) => update("km", event.target.value)} placeholder="58200" />
          </div>
        </div>
        <div className="mt-5 rounded-lg bg-zinc-50 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold">
            <ShieldCheck size={18} className="text-brand-red" />
            LGPD e regulamento
          </div>
          <div className="grid gap-2">
            {terms.map((term) => (
              <label key={term} className="flex items-start gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  className="mt-1 accent-brand-red"
                  checked={accepted.includes(term)}
                  onChange={(event) => {
                    setAccepted((current) => event.target.checked ? [...current, term] : current.filter((item) => item !== term));
                  }}
                />
                <span>{term}</span>
              </label>
            ))}
          </div>
        </div>
        {error ? <p className="mt-3 text-sm font-bold text-brand-red">{error}</p> : null}
        {!confirmed ? (
          <Button className="mt-4 w-full" onClick={confirmData}>Conferir dados e liberar roleta</Button>
        ) : (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
            Dados confirmados. Agora entre no grupo VIP para liberar a roleta.
          </div>
        )}
      </Card>

      <Card className="flex flex-col items-center justify-center overflow-hidden bg-zinc-950 p-5 text-white">
        <div className="flex w-full items-center justify-between gap-3">
          <Pill tone="red">Roleta da sorte</Pill>
          <span className="text-xs font-bold text-zinc-400">{isSpinning ? "Girando por 10 segundos" : "Premio garantido no sistema"}</span>
        </div>
        <div className="relative my-6 flex h-80 w-80 max-w-full items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-brand-red/20 blur-2xl" />
          <div className="absolute -top-1 z-20 flex flex-col items-center drop-shadow-xl">
            <div className="h-5 w-5 rounded-full border-2 border-zinc-950 bg-brand-red" />
            <div className="h-0 w-0 border-x-[18px] border-t-[34px] border-x-transparent border-t-brand-red" />
          </div>
          <div className="absolute inset-3 rounded-full border border-brand-red/40" />
          <motion.div
            animate={{ rotate: rotation || (confirmed ? 18 : 0) }}
            transition={{
              duration: isSpinning ? SPIN_DURATION_SECONDS : 0.8,
              ease: isSpinning ? [0.08, 0.72, 0.16, 1] : "easeOut"
            }}
            className="wheel relative h-72 w-72 rounded-full border-[12px] border-brand-red shadow-2xl"
          >
            <div className="absolute inset-0 rounded-full border-[6px] border-zinc-950/80" />
            <div className="absolute inset-4 rounded-full border border-brand-red/50" />
            {wheelStuds.map((stud) => (
              <div
                key={stud}
                className="absolute left-1/2 top-1/2 h-full w-1 -translate-x-1/2 -translate-y-1/2"
                style={{ transform: `translate(-50%, -50%) rotate(${stud * 20}deg)` }}
              >
                <span className={`absolute left-1/2 top-2 h-2 w-2 -translate-x-1/2 rounded-full shadow ${stud % 2 === 0 ? "bg-brand-red" : "bg-zinc-950"}`} />
              </div>
            ))}
          </motion.div>
          <div className="absolute flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-brand-red bg-zinc-950 text-brand-red shadow-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-brand-red/50">
              <Gift size={34} />
            </div>
          </div>
        </div>
        {error ? <p className="mb-3 text-center text-sm font-bold text-red-200">{error}</p> : null}
        {confirmed ? (
          <a
            href={vipGroupUrl || "#"}
            target="_blank"
            rel="noreferrer"
            onClick={() => setJoinedGroup(true)}
            className="mb-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600"
          >
            <MessageCircle size={18} />
            Entrar no Grupo VIP
          </a>
        ) : null}
        <Button disabled={!confirmed || !joinedGroup || isSpinning} onClick={spin} className="w-full disabled:cursor-not-allowed disabled:opacity-50">
          <RotateCw size={18} />
          {isSpinning ? "Girando... aguarde 10 segundos" : joinedGroup ? "Girar agora" : "Entre no grupo para girar"}
        </Button>
        <p className="mt-3 text-center text-xs text-zinc-400">
          {isSpinning ? "O resultado aparece somente quando a roleta terminar." : "O giro registra cliente, veiculo, premio, codigo e bloqueio por placa/telefone."}
        </p>
      </Card>
    </div>
  );
}
