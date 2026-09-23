# Regiane Goveia Imobiliária — Redesign Profissional

Redesign completo e autoral da presença digital da **Regiane Goveia Imobiliária** (Ibirité / MG — CRECI 8527 PJ).

---

## 🏛️ Identidade e Direção de Arte

* **Anti-IA & Anti-Template**: Ausência total de vícios visuais artificiais (cards repetitivos, círculos decorativos flutuantes, gradientes neon ou textos genéricos de IA).
* **Paleta Autêntica da Marca**:
  * **Verde Esmeralda Nobre** (`#0D5C3A` / `#0F7A46`): Identidade extraída do logotipo oficial, simbolizando solidez e prosperidade.
  * **Verde Floresta Noturno** (`#05150E` / `#081E15`): Profundidade arquitetônica e requinte em headers e rodapé.
  * **Dourado Champanhe** (`#C5A869` / `#DFCB9E`): Badges e selos de qualidade.
  * **Marfim & Off-White Quente** (`#FAF8F5`, `#F3EFE9`): Conforto de leitura visual sem branco hospitalar.
* **Tipografia Editorial**:
  * Títulos: `Outfit` & `Playfair Display`
  * Parágrafos e Dados Técnicos: `Plus Jakarta Sans`

---

## 🚀 Funcionalidades Imobiliárias

1. **Busca e Filtros Instantâneos**:
   * Pesquisa direta por código do imóvel (`1383`, `1378`, `1380`, `1419`, `1326`...).
   * Filtros por Finalidade (Venda / Aluguel), Tipo, Bairro, Dormitórios e Faixa de Preço.
   * Contador em tempo real e botão de reset.
2. **Modal com Galeria Imersiva**:
   * Visualizador ampliado de alta resolução com fotos reais do CDN oficial.
   * Ficha técnica minuciosa (m², suítes, banheiros, vagas, condomínio e IPTU).
   * Botão direto de WhatsApp com mensagem contextualizada.
3. **Simulador de Financiamento Habitacional**:
   * Cálculo interativo de entrada e parcelas estimadas via SAC/Price com botão de consulta direta.
4. **Guia de Documentos de Locação**:
   * Abas interativas para Pessoa Física, Pessoa Jurídica e Modalidades de Garantia (Fiador, Título de Capitalização e Seguro Fiança).
5. **Canal de Captação "Anuncie seu Imóvel"**:
   * Formulário direto para proprietários cadastrarem seus imóveis.

---

## 📂 Estrutura de Arquivos

```
Regiane goveiaimob/
├── index.html                  # Estrutura semântica principal com SEO e Schema.org
├── css/
│   └── styles.css              # Design System autoral, tokens, microinterações e responsividade
├── js/
│   ├── properties-data.js      # Base estruturada com fotos reais, dados e especificações
│   └── app.js                  # Engine de busca, filtros, modal com galeria, simulador e formulários
├── assets/
│   └── img/
│       ├── logo.webp           # Logotipo oficial da Regiane Goveia
│       ├── logo-link.png       # Logotipo de alta definição
│       ├── footer-logo.webp    # Logotipo para fundos escuros
│       └── favicon.ico         # Ícone da marca
├── server.js                   # Servidor Node.js local (porta 5056)
└── README.md                   # Documentação do projeto
```

---

## 🛠️ Como Executar Localmente

Para iniciar o servidor local:

```bash
node server.js
```

Em seguida, acesse no navegador:
`http://localhost:5056`
