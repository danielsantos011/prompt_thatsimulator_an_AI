// Chave para identificar o dados salvos pela minha aplicação
const STORAGE_KEY = "prompts_storage"

// Estado carregar os prompts salvos

const state = {
  prompts: [],
  selectedId: null,
}

// Seleciona elementos por id
const elements = {
  promptTitle: document.getElementById("prompt-title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),
  btnOpen: document.getElementById("btn-open"),
  btnCollapse: document.getElementById("btn-collapse"),
  sidebar: document.querySelector(".sidebar"),
  btnSave: document.getElementById("btn-save"),
  list: document.getElementById("prompt-list"),
  search: document.getElementById("search-input"),
  btnNew: document.getElementById("btn-new"),
  btnCopy: document.getElementById("btn-copy"),
}

// Atualiza o estado do wrapper conforme o conteúdo do elemento
function updateEditableWrapperState(element, wrapper) {
  const hasText = element.textContent.trim().length > 0
  wrapper.classList.toggle("is-empty", !hasText)
}

// Atualiza o estado de todos os elementos editáveis
function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
}

// Adiciona ouvintes de input para atualizar wrappers em tempo real
function attachAllEditableHandlers() {
  if (elements.promptTitle && elements.titleWrapper) {
    elements.promptTitle.addEventListener("input", () => {
      updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
    })
  }
  if (elements.promptContent && elements.contentWrapper) {
    elements.promptContent.addEventListener("input", () => {
      updateEditableWrapperState(
        elements.promptContent,
        elements.contentWrapper
      )
    })
  }
}

function openSidebar() {
  if (window.innerWidth <= 750) {
    elements.sidebar.classList.add("is-open")
    elements.btnOpen.classList.add("is-hidden")
  } else {
    elements.sidebar.style.display = "flex"
    elements.btnOpen.style.display = "none"
  }
}

function closeSidebar() {
  if (window.innerWidth <= 750) {
    elements.sidebar.classList.remove("is-open")
    elements.btnOpen.classList.remove("is-hidden")
  } else {
    elements.sidebar.style.display = "none"
    elements.btnOpen.style.display = "block"
  }
}

function save() {
  const title = elements.promptTitle.textContent.trim()
  const content = elements.promptContent.innerHTML.trim()
  const hasContent = elements.promptContent.textContent.trim()

  if (!title || !hasContent) {
    alert(
      "Por favor, preencha o título ou o conteúdo do prompt antes de salvar."
    )
    return co
  }

  if (state.selectedId) {
    const prompt = state.prompts.find((p) => p.id === state.selectedId)
    if (prompt) {
      prompt.title = title || "Sem título"
      prompt.content = content || "Sem conteúdo"
    }
  } else {
    const newPrompt = {
      id: Date.now().toString(36),
      title,
      content,
    }
    state.prompts.unshift(newPrompt)
    state.selectedId = newPrompt.id
  }
  renderList(elements.search.value)
  persist()
  alert("Prompt salvo com sucesso!")
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts))
  } catch (error) {
    console.error("Erro ao salvar no localStorage", error)
  }
}

function load() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY)
    state.prompts = storage ? JSON.parse(storage) : []
    state.selectedId = null
  } catch {
    console.log("Erro ao carregar do localStorage", error)
  }
}

function createPromptItem(prompt) {
  const tmp = document.createElement("div")
  tmp.innerHTML = prompt.content

  return `

   <li>
<div class="prompt-item" data-id="${prompt.id}" data-action="select">
  <div>
    <div class="prompt-item-title">${prompt.title}</div>
    <div class="prompt-item-description">${tmp.textContent}</div>
  </div>
  <button class="btn-icon" title="Remover" data-action="remove">
    <span class="icon icon-trash">
      <svg
        width="20"
        height="21"
        viewBox="0 0 20 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15.8334 5.50003V17.1667C15.8334 17.6087 15.6578 18.0326 15.3453 18.3452C15.0327 18.6578 14.6088 18.8334 14.1667 18.8334H5.83341C5.39139 18.8334 4.96746 18.6578 4.6549 18.3452C4.34234 18.0326 4.16675 17.6087 4.16675 17.1667V5.50003"
          stroke="#FF5C5C"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M2.5 5.50003H17.5"
          stroke="#FF5C5C"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M6.66675 5.50002V3.83335C6.66675 3.39133 6.84234 2.9674 7.1549 2.65484C7.46746 2.34228 7.89139 2.16669 8.33341 2.16669H11.6667C12.1088 2.16669 12.5327 2.34228 12.8453 2.65484C13.1578 2.9674 13.3334 3.39133 13.3334 3.83335V5.50002"
          stroke="#FF5C5C"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </button>
</div>
</li>
  
  `
}

function renderList(filterText = "") {
  const filteredPrompts = state.prompts
    .filter((prompt) =>
      prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())
    )
    .map((p) => createPromptItem(p))
    .join("")

  elements.list.innerHTML = filteredPrompts
}

function newPrompt() {
  state.selectedId = null
  elements.promptTitle.textContent = ""
  elements.promptContent.textContent = ""
  updateAllEditableStates()
  elements.promptTitle.focus()
}

function copySelected() {
  try {
    const content = elements.promptContent
    return navigator.clipboard.writeText(content.innerText)
  } catch (error) {
    console.log("Erro ao copiar para a área de transferência", error)
  }
}

// Eventos

elements.btnSave.addEventListener("click", save)
elements.btnNew.addEventListener("click", newPrompt)
elements.btnCopy.addEventListener("click", function () {
  // Copia o conteúdo do prompt selecionado, preservando quebras de linha
  const temp = document.createElement("div")
  temp.innerHTML = elements.promptContent.innerHTML
  const text = temp.innerText
  if (!text.trim()) {
    alert("Não há conteúdo para copiar.")
    return
  }
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert("Conteúdo copiado para a área de transferência!")
    })
    .catch(() => {
      alert("Erro ao copiar o conteúdo.")
    })
})

elements.search.addEventListener("input", function (event) {
  renderList(event.target.value)
})

elements.list.addEventListener("click", function (event) {
  const removeBtn = event.target.closest("[data-action='remove']")
  const item = event.target.closest("[data-id]")

  if (!item) return

  const id = item.getAttribute("data-id")
  state.selectedId = id

  if (removeBtn) {
    state.prompts = state.prompts.filter((p) => p.id !== id)
    renderList(elements.search.value)
    persist()
    return
  }

  if (event.target.closest("[data-action='select']")) {
    const prompt = state.prompts.find((p) => p.id === id)

    if (prompt) {
      elements.promptTitle.textContent = prompt.title
      elements.promptContent.innerHTML = prompt.content
      updateAllEditableStates()
    }
  }
})

// Inicialização

function init() {
  load()
  renderList("")
  attachAllEditableHandlers()
  updateAllEditableStates()

  if (window.innerWidth <= 750) {
    elements.sidebar.classList.remove("is-open")
    elements.btnOpen.classList.remove("is-hidden")
  } else {
    elements.sidebar.style.display = "flex"
    elements.btnOpen.style.display = "none"
  }

  elements.btnOpen.addEventListener("click", openSidebar)
  elements.btnCollapse.addEventListener("click", closeSidebar)
}

// Executa a inicialização ao carregar o script
init()
