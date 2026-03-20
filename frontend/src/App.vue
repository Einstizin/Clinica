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
          <h1>Painel de Consultas</h1>
          <p>Organize agendamentos com visual profissional</p>
        </div>
      </header>

      <template v-if="currentView === 'agenda'">
        <div class="dashboard">
          <section class="card login-card">
            <h2>Login</h2>
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
          </section>
<div class="form-grid">
  <div class="field">
    <label>Nome</label>
    <input v-model="registerName" placeholder="Digite seu nome" />
  </div>

  <div class="field">
    <label>Email para cadastro</label>
    <input v-model="registerEmail" placeholder="Digite seu email" />
  </div>

  <div class="field">
    <label>Senha para cadastro</label>
    <input v-model="registerPassword" type="password" placeholder="Digite sua senha" />
  </div>
</div>

<button class="primary-btn secondary-btn" @click="register">
  Cadastrar usuário
</button>
          <section class="card appointment-card">
            <h2>Nova Consulta</h2>

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
                  placeholder="Endereço preenchido automaticamente, mas pode ser editado"
                />
              </div>

              <div class="field">
                <label>Hora</label>
                <select v-model="selectedHour">
                  <option disabled value="">Selecione o horário</option>
                  <option v-for="hour in availableHours" :key="hour" :value="hour">
                    {{ hour }}
                  </option>
                </select>
              </div>

              <div class="field">
                <label>Data escolhida</label>
                <input :value="formattedSelectedDate" readonly />
              </div>
            </div>

            <div class="calendar-box">
              <label class="calendar-label">Escolha a data da consulta</label>
              <VDatePicker v-model="selectedDate" :min-date="new Date()" expanded />
            </div>

            <div class="actions">
              <button class="primary-btn" @click="agendar">Agendar Consulta</button>
            </div>
          </section>

          <section class="card schedule-card">
            <div class="card-header">
              <h2>Agenda</h2>
              <span class="badge">{{ lista.length }} consulta(s)</span>
            </div>

            <div v-if="lista.length" class="appointment-list">
              <div v-for="a in lista" :key="a._id" class="appointment-item">
                <div class="appointment-time">
                  {{ formatDate(a.date) }}
                </div>
                <div class="appointment-info">
                  <strong>{{ a.patient?.name || patientName || 'Paciente' }}</strong>
                  <p>{{ a.address || 'Endereço não informado' }}</p>
                  <small>{{ a.patient?.email || 'Sem email cadastrado' }}</small>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              Nenhuma consulta encontrada.
            </div>
          </section>
        </div>
      </template>

      <template v-else-if="currentView === 'pacientes'">
        <section class="card full-section">
          <h2>Pacientes</h2>
          <p class="section-text">
            Aqui você pode futuramente cadastrar, editar e visualizar pacientes.
          </p>

          <div class="info-box">
            <strong>Paciente informado no formulário:</strong>
            <p>{{ patientName || 'Nenhum paciente informado ainda' }}</p>
            <p><strong>CEP:</strong> {{ cep || 'Não informado' }}</p>
            <p><strong>Endereço:</strong> {{ endereco || 'Nenhum endereço preenchido' }}</p>
          </div>
        </section>
      </template>

      <template v-else-if="currentView === 'atendimentos'">
        <section class="card full-section">
          <h2>Atendimentos</h2>
          <p class="section-text">
            Esta área pode mostrar histórico de atendimentos, status e observações.
          </p>

          <div class="info-box">
            <strong>Total de consultas agendadas:</strong>
            <p>{{ lista.length }}</p>
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
    registerName: '',
registerEmail: '',
registerPassword: '',
    return {
      currentView: 'agenda',
      email: '',
      password: '',
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
    async login() {
      try {
        const r = await api.post('/auth/login', {
          email: this.email,
          password: this.password
        })
        this.token = r.data.token
        localStorage.setItem('token', this.token)
        alert('Login realizado com sucesso!')
        this.carregar()
      } catch (e) {
        alert('Erro ao fazer login')
      }
    },
    async buscarCep() {
      if (!this.cep) return
      try {
        const r = await api.get('/external/cep/' + this.cep)
        this.endereco = [
          r.data.logradouro,
          r.data.bairro,
          r.data.localidade,
          r.data.uf
        ]
          .filter(Boolean)
          .join(', ')
      } catch (e) {
        this.endereco = 'CEP não encontrado'
      }
    },
    buildAppointmentDate() {
      if (!this.selectedDate || !this.selectedHour) return null

      const [hours, minutes] = this.selectedHour.split(':')
      const date = new Date(this.selectedDate)
      date.setHours(Number(hours))
      date.setMinutes(Number(minutes))
      date.setSeconds(0)
      date.setMilliseconds(0)
      return date.toISOString()
    },
    async agendar() {
      if (!this.selectedDate || !this.selectedHour) {
        alert('Selecione a data e o horário da consulta')
        return
      }

      try {
        const appointmentDate = this.buildAppointmentDate()

        await api.post(
          '/appointments',
          {
            date: appointmentDate,
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
      } catch (e) {
        alert('Erro ao agendar consulta. O horário pode já estar ocupado.')
      }
    },
    async carregar() {
      if (!this.token) return
      try {
        const r = await api.get('/appointments', {
          headers: {
            Authorization: this.token
          }
        })
        this.lista = r.data
      } catch (e) {
        this.lista = []
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString('pt-BR')
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
  background: #f3f6fb;
  color: #1f2937;
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
  margin-bottom: 30px;
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
  margin-bottom: 24px;
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

.dashboard {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 20px;
}

.card {
  background: white;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.login-card,
.schedule-card {
  height: fit-content;
}

.schedule-card {
  grid-column: 1 / -1;
}

.full-section {
  width: 100%;
}

.card h2 {
  margin-top: 0;
  margin-bottom: 18px;
  font-size: 22px;
  color: #0f172a;
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
  background: #f8fafc;
  color: #334155;
  cursor: default;
  opacity: 1;
}

.primary-btn {
  margin-top: 18px;
  border: 0;
  background: #2563eb;
  color: white;
  padding: 13px 18px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.primary-btn:hover {
  background: #1d4ed8;
}

.calendar-box {
  margin-top: 20px;
}

.calendar-label {
  display: block;
  margin-bottom: 10px;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.badge {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.appointment-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.appointment-item {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fafcff;
}

.appointment-time {
  font-weight: 700;
  color: #2563eb;
}

.appointment-info p {
  margin: 6px 0;
  color: #475569;
}

.appointment-info small {
  color: #64748b;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  background: #f8fafc;
}

.section-text {
  color: #64748b;
  margin-bottom: 18px;
}

.info-box {
  border: 1px solid #dbe3ee;
  border-radius: 14px;
  padding: 18px;
  background: #f8fafc;
}

@media (max-width: 980px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }

  .dashboard {
    grid-template-columns: 1fr;
  }

  .two-columns {
    grid-template-columns: 1fr;
  }

  .appointment-item {
    grid-template-columns: 1fr;
  }
}
</style>
