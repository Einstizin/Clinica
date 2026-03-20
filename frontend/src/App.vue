<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-icon">+</div>
        <div>
          <h2>Clínica Vida</h2>
          <p>Sistema de Agendamento</p>
        </div>
      </div>

      <nav class="menu">
        <button class="menu-item" :class="{ active: currentView === 'agenda' }" @click="currentView = 'agenda'">
          Agenda
        </button>
        <button class="menu-item" :class="{ active: currentView === 'pacientes' }" @click="currentView = 'pacientes'">
          Pacientes
        </button>
        <button class="menu-item" :class="{ active: currentView === 'atendimentos' }" @click="currentView = 'atendimentos'">
          Atendimentos
        </button>
      </nav>
    </aside>

    <main class="content">
      <header class="topbar">
        <h1>Painel de Consultas</h1>
      </header>

      <!-- AGENDA -->
      <template v-if="currentView === 'agenda'">
        <div class="dashboard">

          <!-- LOGIN + CADASTRO -->
          <section class="card">
            <h2>Login</h2>

            <div class="form-grid">
              <input v-model="email" placeholder="Email" />
              <input v-model="password" type="password" placeholder="Senha" />
            </div>

            <button class="primary-btn" @click="login">Entrar</button>

            <hr />

            <h3>Cadastrar</h3>

            <div class="form-grid">
              <input v-model="registerName" placeholder="Nome" />
              <input v-model="registerEmail" placeholder="Email" />
              <input v-model="registerPassword" type="password" placeholder="Senha" />
            </div>

            <button class="secondary-btn" @click="register">
              Cadastrar usuário
            </button>
          </section>

          <!-- AGENDAMENTO -->
          <section class="card">
            <h2>Nova Consulta</h2>

            <div class="form-grid">
              <input v-model="patientName" placeholder="Paciente" />
              <input v-model="cep" placeholder="CEP" @blur="buscarCep" />
              <input v-model="endereco" placeholder="Endereço" />

              <select v-model="selectedHour">
                <option disabled value="">Horário</option>
                <option v-for="h in availableHours" :key="h">{{ h }}</option>
              </select>

              <input :value="formattedSelectedDate" readonly />
            </div>

            <VDatePicker v-model="selectedDate" :min-date="new Date()" expanded />

            <button class="primary-btn" @click="agendar">
              Agendar Consulta
            </button>
          </section>

          <!-- LISTA -->
          <section class="card full">
            <h2>Consultas</h2>

            <div v-if="lista.length">
              <div v-for="a in lista" :key="a._id" class="item">
                {{ formatDate(a.date) }} - {{ a.address }}
              </div>
            </div>

            <div v-else>Nenhuma consulta</div>
          </section>

        </div>
      </template>

      <!-- PACIENTES -->
      <template v-if="currentView === 'pacientes'">
        <div class="card">
          <h2>Pacientes</h2>
          <p>Paciente atual: {{ patientName || 'Nenhum' }}</p>
        </div>
      </template>

      <!-- ATENDIMENTOS -->
      <template v-if="currentView === 'atendimentos'">
        <div class="card">
          <h2>Atendimentos</h2>
          <p>Total: {{ lista.length }}</p>
        </div>
      </template>

    </main>
  </div>
</template>

<script>
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://clinica-wkzp.onrender.com'
})

export default {
  data() {
    return {
      currentView: 'agenda',

      email: '',
      password: '',

      registerName: '',
      registerEmail: '',
      registerPassword: '',

      token: localStorage.getItem('token') || '',

      patientName: '',
      cep: '',
      endereco: '',
      selectedDate: new Date(),
      selectedHour: '',

      availableHours: ['08:00','09:00','10:00','11:00','13:00','14:00'],

      lista: []
    }
  },

  computed: {
    formattedSelectedDate() {
      return new Date(this.selectedDate).toLocaleDateString('pt-BR')
    }
  },

  methods: {
    async register() {
      try {
        await api.post('/auth/register', {
          name: this.registerName,
          email: this.registerEmail,
          password: this.registerPassword,
          role: 'paciente'
        })

        alert('Cadastrado!')
      } catch {
        alert('Erro cadastro')
      }
    },

    async login() {
      try {
        const r = await api.post('/auth/login', {
          email: this.email,
          password: this.password
        })

        this.token = r.data.token
        localStorage.setItem('token', this.token)

        alert('Login OK')
        this.carregar()
      } catch {
        alert('Erro login')
      }
    },

    async buscarCep() {
      try {
        const r = await api.get('/external/cep/' + this.cep)
        this.endereco = `${r.data.logradouro}, ${r.data.localidade}`
      } catch {
        this.endereco = 'Erro CEP'
      }
    },

    buildDate() {
      const [h, m] = this.selectedHour.split(':')
      const d = new Date(this.selectedDate)
      d.setHours(h, m)
      return d.toISOString()
    },

    async agendar() {
      try {
        await api.post('/appointments',
          { date: this.buildDate(), address: this.endereco },
          { headers: { Authorization: this.token } }
        )

        alert('Agendado!')
        this.carregar()
      } catch {
        alert('Erro agendamento')
      }
    },

    async carregar() {
      try {
        const r = await api.get('/appointments', {
          headers: { Authorization: this.token }
        })
        this.lista = r.data
      } catch {}
    },

    formatDate(d) {
      return new Date(d).toLocaleString('pt-BR')
    }
  },

  mounted() {
    this.carregar()
  }
}
</script>

<style>
body { margin:0; font-family: Arial; background:#f3f6fb; }

.app-shell { display:flex; }

.sidebar { width:220px; background:#0f172a; color:white; padding:20px; }

.menu-item {
  display:block;
  width:100%;
  padding:10px;
  margin:5px 0;
  background:none;
  color:white;
  border:none;
  cursor:pointer;
}

.menu-item.active { background:#2563eb; }

.content { flex:1; padding:20px; }

.card {
  background:white;
  padding:20px;
  border-radius:10px;
  margin-bottom:20px;
}

.form-grid {
  display:flex;
  flex-direction:column;
  gap:10px;
}

input, select {
  padding:10px;
  border-radius:8px;
  border:1px solid #ccc;
}

.primary-btn {
  background:#2563eb;
  color:white;
  border:none;
  padding:10px;
  margin-top:10px;
  cursor:pointer;
}

.secondary-btn {
  background:#0f766e;
  color:white;
  border:none;
  padding:10px;
  margin-top:10px;
}

.full { width:100%; }

.item {
  padding:10px;
  border-bottom:1px solid #eee;
}
</style>
