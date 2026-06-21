"use client";

import { motion } from "framer-motion";
import { Gift, MessageCircle, RotateCw, ShieldCheck, TicketCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useState } from "react";
import type { Prize, Redemption } from "@/lib/types";
import { isBrazilianPhone, isBrazilianPlate, sanitizeText } from "@/lib/validators";
import { Button, Card, FieldLabel, Input, Pill } from "./ui";

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

export function RouletteExperience({ vipGroupUrl }: { vipGroupUrl: string }) {
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

      setRotation(data.rotation);
      window.setTimeout(() => {
        setResult(data);
        setIsSpinning(false);
      }, 1800);
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
          <Button variant="secondary">Como chegar</Button>
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

      <Card className="flex flex-col items-center justify-center overflow-hidden bg-zinc-950 text-white">
        <Pill tone="red">Roleta da sorte</Pill>
        <div className="relative my-5 flex h-72 w-72 items-center justify-center">
          <div className="absolute top-0 z-10 h-0 w-0 border-x-[14px] border-t-[28px] border-x-transparent border-t-white" />
          <motion.div
            animate={{ rotate: rotation || (confirmed ? 18 : 0) }}
            transition={{ duration: 4, ease: "circOut" }}
            className="wheel h-64 w-64 rounded-full border-[10px] border-white shadow-2xl"
          />
          <div className="absolute flex h-20 w-20 items-center justify-center rounded-full bg-white text-brand-red shadow-xl">
            <Gift size={34} />
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
          {isSpinning ? "Registrando..." : joinedGroup ? "Girar agora" : "Entre no grupo para girar"}
        </Button>
        <p className="mt-3 text-center text-xs text-zinc-400">O giro agora registra cliente, veiculo, premio, codigo e bloqueio por placa/telefone.</p>
      </Card>
    </div>
  );
}
