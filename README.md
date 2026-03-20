

# RELATÓRIO TÉCNICO FINAL

**BigBag Coins – Modelagem Econômica, Métricas e Estrutura do Sistema**

---

## 1. Objetivo

Este relatório define a modelagem econômica, as métricas-chave e a estrutura lógica necessária para desenvolvimento de um sistema de simulação e acompanhamento da viabilidade do BigBag Coins, permitindo analisar desempenho financeiro, escalabilidade e sustentabilidade do modelo de negócio.

---

## 2. Descrição do Modelo

O BigBag Coins é um modelo de assinatura no qual:

* O cliente paga um valor fixo mensal (ticket médio (T))
* Recebe créditos ampliados ((\alpha > 1))
* Utiliza esses créditos em hortifrutis parceiros
* A empresa negocia descontos com o varejista com base no volume agregado

O modelo depende de **ganho de escala** para compensar o crédito concedido ao cliente.

---

## 3. Parâmetros do Sistema (Inputs)

O sistema deve permitir ajuste dinâmico dos seguintes parâmetros:

### Mercado e crescimento

* Clientes iniciais ((N_0))
* Taxa de crescimento mensal ((r))
* Horizonte de simulação (meses)

### Receita

* Ticket médio ((T))

### Benefício ao cliente

* Fator de crédito ((\alpha))

### Margem do varejista

* Margem máxima ((m_{max}))
* Velocidade de crescimento da margem ((k))

### Custos

* CAC (custo de aquisição por cliente)
* Custos fixos mensais ((F))

### Retenção

* Tempo médio de permanência (em meses)

---

## 4. Modelagem Matemática

### 4.1 Crescimento de clientes

[
N_t = N_0 \cdot (1 + r)^t
]

---

### 4.2 Receita

[
R_t = N_t \cdot T
]

---

### 4.3 Crédito concedido

[
C_{credito,t} = N_t \cdot T \cdot \alpha
]

---

### 4.4 Função de margem (escala)

[
m(V_t) = m_{max} \cdot (1 - e^{-k \cdot V_t})
]

Onde:
[
V_t = R_t
]

---

### 4.5 Custo dos produtos

[
C_{prod,t} = C_{credito,t} \cdot (1 - m(V_t))
]

---

### 4.6 Aquisição de clientes

[
\Delta N_t = N_t - N_{t-1}
]
[
C_{CAC,t} = CAC \cdot \Delta N_t
]

---

### 4.7 Custo total

[
C_t = C_{prod,t} + C_{CAC,t} + F
]

---

### 4.8 Lucro

[
L_t = R_t - C_t
]

---

## 5. Métricas-Chave (KPIs)

O sistema deve calcular automaticamente:

### 5.1 Margem por cliente

[
\text{Margem} = T - (T \cdot \alpha \cdot (1 - m(V_t)))
]

---

### 5.2 LTV (Lifetime Value)

[
LTV = \text{margem mensal} \cdot \text{retenção}
]

---

### 5.3 CAC Payback

[
\text{Payback} = \frac{CAC}{\text{margem mensal}}
]

---

### 5.4 Relação LTV/CAC

[
\frac{LTV}{CAC}
]

---

### 5.5 Break-even

Menor (t) tal que:
[
L_t \geq 0
]

---

### 5.6 Margem efetiva do negócio

[
\frac{L_t}{R_t}
]

---

## 6. Condição de Viabilidade

O modelo é viável quando:

[
m(V_t) > 1 - \frac{1}{\alpha}
]

Exemplo (α = 1.05):
[
m(V_t) > 4.76%
]

---

## 7. Lógica Econômica do Sistema

### Fase 1 – Inicial

* Baixo volume
* Margem próxima de zero
* Prejuízo operacional

---

### Fase 2 – Crescimento

* Aumento de clientes
* Melhora da margem
* Redução do prejuízo

---

### Fase 3 – Escala

* Margem próxima ao máximo
* Diluição de CAC e custos fixos
* Lucro positivo

---

## 8. Resultados Esperados (Cenário Base)

Com parâmetros ajustados, o modelo apresenta:

* Break-even: mês 18 (~687 clientes)
* Payback: 2,3 meses
* LTV: R$387
* LTV/CAC: 7,74x
* Margem final: 15%
* Lucro mensal final: ~R$11.900

---

## 9. Gráficos Obrigatórios do Sistema

O sistema deve gerar:

### 9.1 Crescimento de clientes

Clientes vs tempo

---

### 9.2 Receita vs custo

Curvas de (R_t) e (C_t)

---

### 9.3 Lucro ao longo do tempo

Curva de (L_t) com destaque para break-even

---

### 9.4 Margem vs volume

(m(V_t)) em função do volume

---

### 9.5 Break-even

Lucro vs número de clientes

---

## 10. Estrutura do Sistema (Software)

O sistema deve conter:

### Entrada de dados

* Interface para parâmetros ajustáveis

### Motor de cálculo

* Implementação das equações
* Simulação mês a mês

### Camada analítica

* Cálculo de KPIs
* Identificação automática de break-even

### Visualização

* Gráficos dinâmicos
* Comparação de cenários

---

## 11. Simulação de Cenários

O sistema deve permitir:

### Cenário pessimista

* α alto
* margem baixa
* CAC alto

### Cenário realista

* parâmetros base

### Cenário otimista

* α menor
* margem maior
* CAC menor

---

## 12. Principais Sensibilidades

O modelo é mais sensível a:

1. Fator de crédito ((\alpha))
2. Margem do varejista ((m_{max}))
3. Velocidade da margem ((k))
4. CAC
5. Ticket médio

---

## 13. Riscos do Modelo

* Margem insuficiente para cobrir crédito
* Crescimento sem escala de negociação
* CAC elevado
* Retenção abaixo do esperado

---

## 14. Conclusão

O BigBag Coins apresenta viabilidade econômica condicionada ao ganho de escala e à obtenção de margens comerciais suficientes para compensar o crédito ampliado concedido ao cliente. A modelagem demonstra que o negócio opera inicialmente com prejuízo planejado, revertido ao longo do tempo com crescimento da base de clientes e aumento do poder de negociação com o varejo.

O sistema proposto permite validar, ajustar e otimizar o modelo antes da execução real, reduzindo riscos e apoiando decisões estratégicas baseadas em dados.