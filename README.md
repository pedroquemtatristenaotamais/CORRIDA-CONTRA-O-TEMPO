# Corrida Contra o Tempo

Jogo de plataforma 2D feito com HTML, CSS e JavaScript puro. Extraia o ZIP e abra `index.html` no Chrome, Firefox ou outro navegador moderno. Não precisa instalar dependências nem iniciar um servidor.

## Objetivo

Chegue à bandeira antes que o cronômetro zere. Complete as três fases, colete moedas, ative checkpoints e tente bater seu recorde.

## Controles

- `A` / `D` ou `←` / `→`: movimentar
- `Espaço` ou `↑`: pular; pressione novamente no ar para fazer um salto duplo
- `Shift`: investida rápida, com recarga
- `P` ou `Esc`: pausar / continuar
- Botões no topo: alternar efeitos sonoros e pausar
- No celular ou tablet: use os botões de toque

## Dificuldade

Escolha no menu inicial:

- **Tranquilo:** 28% mais tempo, velocidade de obstáculos reduzida e 4 vidas
- **Normal:** desafio equilibrado e 3 vidas
- **Insano:** 20% menos tempo, drones mais rápidos e 2 vidas

A dificuldade escolhida fica salva no navegador.

## Itens e desafios

- **Moedas:** +100 pontos; moedas coletadas em sequência aumentam o combo e o valor de cada uma
- **Relógios dourados:** +6 segundos e +200 pontos
- **Raios:** ativam turbo temporário
- **Escudos:** protegem de uma colisão durante alguns segundos
- **Checkpoints:** salvam um ponto de retorno e concedem +150 pontos
- **Caixas, espinhos e drones móveis:** causam perda de vida
- **Bônus de chegada:** pontos extras por cada segundo restante

O recorde, a preferência de som e a dificuldade ficam salvos localmente, quando o armazenamento do navegador está disponível.

## Estrutura

```text
corrida-contra-o-tempo/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── game.js
└── README.md
```
