import type { Prize } from "./types";
import { generatePrizeCode } from "./utils";

export interface DrawResult {
  prize: Prize;
  code: string;
  validUntil: string;
  rotation: number;
}

export function drawPrize(prizes: Prize[]): DrawResult {
  const available = prizes.filter((prize) => prize.status === "ativo" && prize.estoqueDisponivel > 0);
  if (available.length === 0) {
    throw new Error("Nenhum premio disponivel nesta campanha.");
  }

  const total = available.reduce((sum, prize) => sum + prize.probabilidade, 0);
  if (total <= 0) {
    throw new Error("Configure a chance de sorteio dos premios ativos.");
  }
  let pick = Math.random() * total;
  const prize = available.find((item) => {
    pick -= item.probabilidade;
    return pick <= 0;
  }) ?? available[available.length - 1];

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + prize.validadeDias);

  return {
    prize,
    code: generatePrizeCode(2026),
    validUntil: validUntil.toLocaleDateString("pt-BR"),
    rotation: 1440 + Math.floor(Math.random() * 720)
  };
}
