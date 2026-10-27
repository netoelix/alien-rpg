# Revisão de assets — 27/10/2026

Implementação local: 19 desenhos revisados (incluindo rampa), 26 assets novos e duas faixas desenháveis. Sem build ou publicação.

## Desenhos revisados

- Balcão de bar · cuba e escorredor (2.4 × 0.8 m).
- Balcão de bar em L · cuba e área de serviço (2.4 × 2.4 m).
- Torre de chope · bandeja e quatro torneiras (1.5 × 0.7 m).
- Caixa de cassino · guichê com bandejas e terminal (2.6 × 1.2 m).
- Palco modular · tablado e degraus frontais (4 × 3 m).
- Penteadeira · espelho linear e iluminação (1.4 × 0.65 m).
- Penteadeira dupla · dois postos de camarim (2.4 × 0.65 m).
- Barraca de feira · balcão, bancada e postes (sem cobertura) (3 × 2.5 m).
- Balcão de comércio · superfície livre (2 × 0.8 m).
- Quiosque · guichê, terminal e cadeira (sem cobertura) (2.5 × 2.5 m).
- Banco de estação · quatro assentos com braços (3 × 0.75 m).
- Lavatório coletivo · três cubas e torneiras (2.4 × 0.6 m).
- Ilha de vestiário · armários centrais e bancos laterais (2.4 × 1.2 m).
- Balcão de refeições · cubas aquecidas e trilho de bandejas (3 × 0.9 m).
- Tratamento de água · membranas, bomba e coletores (2.6 × 1.5 m).
- Reator · núcleo, anel de contenção e conexões (3.6 × 3.6 m).
- Motor industrial · bloco, transmissão e radiador (2 × 3.4 m).
- Escotilha de manutenção · aro e travas (1 × 1 m).
- Rampa de acesso: superfície inclinada, guias laterais, indicação de subida e extremidades distintas.

Balcões agora mostram cuba, borda, ralo, torneira e escorredor. O lavatório tem três pias individuais. Penteadeiras usam espelho e iluminação; palco usa tablado e degraus. Quiosque tem atendimento, terminal e assento; barraca mantém bancadas e postes, com espaço central livre. A ilha de vestiário separa armários e bancos. Tratamento de água usa membranas, tubulação, bomba e painel, diferente dos barris de bebidas.

## Novos assets

### bar

- Rack de barris pressurizados (2.2 × 1.2 m).
- Estação de lavagem de copos · cuba e máquina (1.6 × 0.8 m).
- Banco de bar em L · assentos estofados (2 × 2 m).
- Mesa de shuffleboard (3 × 0.75 m).

### casino

- Mesa de bacará · lugares e área do crupiê (3 × 1.7 m).
- Terminal de apostas retro · painel inclinado (0.85 × 1.1 m).
- Cofre de fichas · gabinete e bandejas (1.5 × 0.8 m).
- Separador de fila · dois postes e cordão (1.8 × 0.35 m).

### entertainment

- Arara de figurinos · suportes e cabides (2 × 0.6 m).
- Baú de bastidores reforçado (1.4 × 0.75 m).

### market

- Gôndola comercial · ilha de prateleiras (2.4 × 1 m).
- Caixa de comércio · esteira e terminal (2.2 × 0.9 m).
- Expositor de feira · caixas inclinadas vazias (2.4 × 1 m).
- Porta de enrolar comercial · módulo recolhido (3 × 0.4 m).

### transit

- Alto-falante de estação · corneta e suporte (0.5 × 0.75 m).
- Máquina de venda automática retro (1.2 × 0.85 m).
- Grade de contenção · pés e travessas (2 × 0.55 m).
- Bagageiro de estação · estrutura tubular (1.8 × 0.8 m).

### floor-signage

- Cone de segurança · base quadrada (0.45 × 0.45 m).
- Cavalete de sinalização dobrável (0.6 × 0.45 m).

### galley

- Ilha de preparo · tampo livre e cuba (2.4 × 1.2 m).
- Chapa industrial · grelha e controles (1.2 × 0.9 m).
- Forno de padaria · gabinete duplo (1.6 × 1.2 m).
- Bancada refrigerada de preparo (2 × 0.8 m).

### engineering

- Tanque de processo · vaso vertical com bombas (2.4 × 2.4 m).
- Bancada pesada · torno de bancada e painel técnico (2.8 × 1 m).

## Catálogo e compatibilidade

O catálogo passa a ter famílias recolhidas, com categorias dentro delas. A busca abre os grupos correspondentes. Os 13 ícones abaixo saem das novas inserções; mapas antigos continuam aceitos e recebem o desenho equivalente, preservando posição, tamanho e rotação.

| Identificador antigo | Alternativa |
| --- | --- |
| console | commandBench |
| bed | crewBed |
| cryo | cryoPodPlan |
| table | diningTable |
| crate | reinforcedCrate |
| chair | operatorSeat |
| medical | examBed |
| locker | wallLocker |
| tank | horizontalTank |
| rack | storageShelf |
| workbench | serviceBench |
| kitchen | industrialRange |
| sofa | loungeSofa |

## Sinalização desenhável

Traçado oferece faixa de segurança e faixa de circulação, com largura e curvas. A sinalização acompanha o percurso, sem piso opaco. Os assets estáticos anteriores continuam disponíveis.

## Verificação

235 testes aprovados, incluindo persistência, biblioteca de módulos, compatibilidade antiga e renderização dos assets. Pranchas SVG renderizadas e inspecionadas, incluindo sinalização curva e rampa. A interação no navegador e a aprovação estética final ainda dependem da conferência abaixo.

## Conferência do usuário

- Comparar balcões, torre de bebidas, caixa de cassino, palco e penteadeiras.
- Conferir barraca, quiosque, assentos, lavatório, vestiário e distribuição de comida.
- Experimentar os novos assets por categoria, sobre pisos e outros objetos.
- Abrir um mapa antigo e conferir equipamentos substituídos, posição, escala e rotação.
- Testar famílias recolhidas e busca no catálogo.
- Desenhar faixas retas e curvas; salvar/reabrir e exportar.
- Conferir reator, motor, tanque, bancada e tratamento de água.

A simplificação geral dos textos e controles da página será discutida em outra etapa. Relevo permanece suspenso.
