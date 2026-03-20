<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-icon">+</div>
        <div>
          <h2>Clínica Vida</h2>
          <p>Gestão de Consultas</p>
        </div>
      </div>

      <nav class="menu">
        <button
          class="menu-item"
          :class="{ active: currentView === 'agenda' }"
          @click="currentView = 'agenda'"
        >
          Agenda
        </button>

        <button
          class="menu-item"
          :class="{ active: currentView === 'pacientes' }"
          @click="currentView = 'pacientes'"
        >
          Pacientes
        </button>

        <button
          class="menu-item"
          :class="{ active: currentView === 'atendimentos' }"
          @click="currentView = 'atendimentos'"
        >
          Atendimentos
        </button>
      </nav>
    </aside>

    <main class="content">
      <header class="topbar">
        <div>
          <h1>Sistema de Agendamento</h1>
          <p>Controle de consultas, pacientes e atendimentos</p>
        </div>

        <div class="topbar-badge" v-if="token">
          Usuário autenticado
        </div>
      </header>

      <template v-if="currentView === 'agenda'">
        <div class="grid-layout">
          <section class="card">
            <div class="section-header">
              <h2>Acesso ao Sistema</h2>
              <span class="muted">Login e cadastro</span>
            </div>

            <div class="divider"></div>

            <h3 class="sub-title">Login</h3>
            <div class="form-grid">
              <div class="field">
                <label>Email</label>
                <input v-model="email" placeholder="Digite seu email" />
              </div>

              <div class="field">
                <label>Senha</label>
                <input v-model="password" type="password" placeholder="Digite sua senha" />
              </div>
            </div>

            <button class="primary-btn" @click="login">Entrar</button>

            <div class="divider"></div>

            <h3 class="sub-title">Cadastro</h3>
            <div class="form-grid">
              <div class="field">
                <label>Nome</label>
                <input v-model="registerName" placeholder="Digite seu nome" />
              </div>

              <div class="field">
                <label>Email</label>
                <input v-model="registerEmail" placeholder="Digite seu email" />
              </div>

              <div class="field">
                <label>Senha</label>
                <input
                  v-model="registerPassword"
                  type="password"
                  placeholder="Crie uma senha"
                />
              </div>
            </div>

            <button class="secondary-btn" @click="register">
              Cadastrar usuário
            </button>
          </section>

          <section class="card">
            <div class="section-header">
              <h2>Nova Consulta</h2>
              <span class="muted">Agendamento</span>
            </div>

            <div class="form-grid two-columns">
              <div class="field">
                <label>Paciente</label>
                <input v-model="patientName" placeholder="Nome do paciente" />
              </div>

              <div class="field">
                <label>CEP</label>
                <input v-model="cep" placeholder="Digite o CEP" @blur="buscarCep" />
              </div>

              <div class="field full">
                <label>Endereço</label>
                <input
                  v-model="endereco"
                  placeholder="Endereço preenchido automaticamente"
                />
              </div>

              <div class="field">
                <label>Horário</label>
                <select v-model="selectedHour">
                  <option disabled value="">Selecione um horário</option>
                  <option v-for="h in availableHours" :key="h" :value="h">
                    {{ h }}
                  </option>
                </select>
              </div>

              <div class="field">
                <label>Data selecionada</label>
                <input :value="formattedSelectedDate" readonly />
              </div>
            </div>

            <div class="calendar-wrapper">
              <label class="calendar-label">Escolha a data da consulta</label>
              <VDatePicker v-model="selectedDate" :min-date="new Date()" expanded />
            </div>

            <button class="primary-btn" @click="agendar">Agendar consulta</button>
          </section>

          <section class="card full-width">
            <div class="section-header">
              <h2>Próximas Consultas</h2>
              <span class="pill">{{ lista.length }} agendamento(s)</span>
            </div>

            <div v-if="lista.length" class="appointments-list">
              <div v-for="a in lista" :key="a._id" class="appointment-card">
                <div class="appointment-date">
                  {{ formatDate(a.date) }}
                </div>

                <div class="appointment-body">
                  <h4>{{ a.patient?.name || patientName || 'Paciente' }}</h4>
                  <p>{{ a.address || 'Endereço não informado' }}</p>
                  <small>{{ a.patient?.email || 'Email não disponível' }}</small>
                </div>
              </div>
            </div>

            <div v-else class="empty-box">
              Nenhuma consulta cadastrada no momento.
            </div>
          </section>
        </div>
      </template>

      <template v-else-if="currentView === 'pacientes'">
        <section class="card">
          <div class="section-header">
            <h2>Pacientes</h2>
            <span class="muted">Informações gerais</span>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <span class="info-label">Paciente atual</span>
              <strong>{{ patientName || 'Nenhum paciente informado' }}</strong>
            </div>

            <div class="info-card">
              <span class="info-label">Endereço atual</span>
              <strong>{{ endereco || 'Nenhum endereço preenchido' }}</strong>
            </div>

            <div class="info-card">
              <span class="info-label">Consultas registradas</span>
              <strong>{{ lista.length }}</strong>
            </div>
          </div>
        </section>
      </template>

      <template v-else-if="currentView === 'atendimentos'">
        <section class="card">
          <div class="section-header">
            <h2>Atendimentos</h2>
            <span class="muted">Histórico dos agendamentos</span>
          </div>

          <div v-if="lista.length" class="table-wrapper">
            <table class="appointments-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Data</th>
                  <th>Horário</th>
                  <th>Endereço</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in lista" :key="a._id">
                  <td>{{ a.patient?.name || patientName || 'Paciente' }}</td>
                  <td>{{ formatOnlyDate(a.date) }}</td>
                  <td>{{ formatOnlyTime(a.date) }}</td>
                  <td>{{ a.address || 'Não informado' }}</td>
                  <td>{{ a.patient?.email || 'Não disponível' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="empty-box">
            Nenhum atendimento encontrado.
          </div>
        </section>
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

      availableHours: [
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00'
      ],

      lista: []
    }
  },

  computed: {
    formattedSelectedDate() {
      if (!this.selectedDate) return ''
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

        this.email = this.registerEmail
        this.password = this.registerPassword

        alert('Usuário cadastrado com sucesso!')
      } catch (error) {
        alert('Erro ao cadastrar usuário')
      }
    },

    async login() {
      try {
        const response = await api.post('/auth/login', {
          email: this.email,
          password: this.password
        })

        this.token = response.data.token
        localStorage.setItem('token', this.token)

        alert('Login realizado com sucesso!')
        this.carregar()
      } catch (error) {
        alert('Erro ao fazer login')
      }
    },

    async buscarCep() {
      if (!this.cep) return

      try {
        const response = await api.get('/external/cep/' + this.cep)

        this.endereco = [
          response.data.logradouro,
          response.data.bairro,
          response.data.localidade,
          response.data.uf
        ]
          .filter(Boolean)
          .join(', ')
      } catch (error) {
        this.endereco = 'Erro ao buscar CEP'
      }
    },

    buildDate() {
      const [hour, minute] = this.selectedHour.split(':')
      const date = new Date(this.selectedDate)

      date.setHours(Number(hour))
      date.setMinutes(Number(minute))
      date.setSeconds(0)
      date.setMilliseconds(0)

      return date.toISOString()
    },

    async agendar() {
      if (!this.token) {
        alert('Faça login antes de agendar')
        return
      }

      if (!this.selectedHour) {
        alert('Selecione um horário')
        return
      }

      try {
        await api.post(
          '/appointments',
          {
            date: this.buildDate(),
            address: this.endereco
          },
          {
            headers: {
              Authorization: this.token
            }
          }
        )

        alert('Consulta agendada com sucesso!')
        this.carregar()
      } catch (error) {
        alert('Erro ao agendar consulta')
      }
    },

    async carregar() {
      if (!this.token) return

      try {
        const response = await api.get('/appointments', {
          headers: {
            Authorization: this.token
          }
        })

        this.lista = response.data
      } catch (error) {
        this.lista = []
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleString('pt-BR')
    },

    formatOnlyDate(date) {
      return new Date(date).toLocaleDateString('pt-BR')
    },

    formatOnlyTime(date) {
      return new Date(date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },

  mounted() {
    this.carregar()
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  font-family: Arial, Helvetica, sans-serif;
}

body {
  margin: 0;
  background: #f4f7fb;
  color: #1e293b;
}

.app-shell {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
}

.sidebar {
  background: linear-gradient(180deg, #0f172a, #1e293b);
  color: white;
  padding: 28px 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 34px;
}

.brand-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
}

.brand h2 {
  margin: 0;
  font-size: 20px;
}

.brand p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #cbd5e1;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-item {
  width: 100%;
  border: 0;
  background: transparent;
  color: white;
  text-align: left;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  transition: 0.2s;
}

.menu-item.active,
.menu-item:hover {
  background: rgba(255, 255, 255, 0.12);
}

.content {
  padding: 28px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 26px;
  gap: 16px;
}

.topbar h1 {
  margin: 0;
  font-size: 30px;
  color: #0f172a;
}

.topbar p {
  margin: 8px 0 0;
  color: #64748b;
}

.topbar-badge {
  background: #dcfce7;
  color: #166534;
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 20px;
}

.card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.full-width {
  grid-column: 1 / -1;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  gap: 10px;
}

.section-header h2 {
  margin: 0;
  color: #0f172a;
}

.muted {
  color: #64748b;
  font-size: 14px;
}

.sub-title {
  margin: 0 0 14px;
  color: #0f172a;
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 22px 0;
}

.form-grid {
  display: grid;
  gap: 16px;
}

.two-columns {
  grid-template-columns: 1fr 1fr;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field.full {
  grid-column: 1 / -1;
}

label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

input,
select {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #dbe3ee;
  border-radius: 12px;
  font-size: 15px;
  background: #f8fafc;
  outline: none;
}

input:focus,
select:focus {
  border-color: #2563eb;
  background: white;
}

input[readonly] {
  opacity: 1;
  cursor: default;
}

.primary-btn,
.secondary-btn {
  border: 0;
  padding: 13px 18px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 16px;
}

.primary-btn {
  background: #2563eb;
  color: white;
}

.primary-btn:hover {
  background: #1d4ed8;
}

.secondary-btn {
  background: #0f766e;
  color: white;
}

.secondary-btn:hover {
  background: #0d5f59;
}

.calendar-wrapper {
  margin-top: 20px;
}

.calendar-label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #334155;
}

.pill {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.appointment-card {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
  padding: 18px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fafcff;
}

.appointment-date {
  font-weight: 700;
  color: #2563eb;
}

.appointment-body h4 {
  margin: 0 0 6px;
  color: #0f172a;
}

.appointment-body p {
  margin: 0 0 6px;
  color: #475569;
}

.appointment-body small {
  color: #64748b;
}

.empty-box {
  padding: 20px;
  text-align: center;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
  background: #f8fafc;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.info-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px;
}

.info-label {
  display: block;
  color: #64748b;
  margin-bottom: 8px;
  font-size: 14px;
}

.table-wrapper {
  overflow-x: auto;
}

.appointments-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.appointments-table th,
.appointments-table td {
  text-align: left;
  padding: 14px 12px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
}

.appointments-table th {
  color: #334155;
  background: #f8fafc;
}

.appointments-table td {
  color: #475569;
}

@media (max-width: 980px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }

  .grid-layout {
    grid-template-columns: 1fr;
  }

  .two-columns {
    grid-template-columns: 1fr;
  }

  .appointment-card {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
