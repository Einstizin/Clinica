<template>
  <div class="page">
    <template v-if="!token">
      <div class="auth-wrapper">
        <div class="auth-brand">
          <div class="logo">+</div>
          <h1>Clínica Vida</h1>
          <p>Sistema profissional de agendamento</p>
        </div>

        <div class="auth-card">
          <div class="auth-tabs">
            <button
              :class="['tab-btn', { active: authMode === 'login' }]"
              @click="changeAuthMode('login')"
            >
              Entrar
            </button>
            <button
              :class="['tab-btn', { active: authMode === 'register' }]"
              @click="changeAuthMode('register')"
            >
              Criar conta
            </button>
            <button
              :class="['tab-btn', { active: authMode === 'verify' }]"
              @click="changeAuthMode('verify')"
            >
              Verificar email
            </button>
          </div>

          <div v-if="authMode === 'login'">
            <h2>Entrar na sua conta</h2>
            <p class="auth-subtitle">Use seu email e senha para acessar o sistema.</p>

            <div class="field">
              <label>Email</label>
              <input v-model="email" type="email" placeholder="seuemail@exemplo.com" />
            </div>

            <div class="field">
              <label>Senha</label>
              <input v-model="password" type="password" placeholder="Digite sua senha" />
            </div>

            <button class="main-btn" @click="login">Entrar</button>
          </div>

          <div v-else-if="authMode === 'register'">
            <h2>Criar uma conta</h2>
            <p class="auth-subtitle">Cadastre um novo usuário para acessar o sistema.</p>

            <div class="field">
              <label>Nome</label>
              <input v-model="registerName" placeholder="Seu nome completo" />
            </div>

            <div class="field">
              <label>Email</label>
              <input
                v-model="registerEmail"
                type="email"
                placeholder="seuemail@exemplo.com"
              />
            </div>

            <div class="field">
              <label>Senha</label>
              <input
                v-model="registerPassword"
                type="password"
                placeholder="Crie uma senha"
              />
            </div>

            <div class="field">
              <label>Tipo de usuário</label>
              <select v-model="registerRole">
                <option value="paciente">Paciente</option>
                <option value="secretario">Secretário</option>
              </select>
            </div>

            <button class="main-btn" @click="register">Criar conta</button>

            <div v-if="temporaryVerificationCode" class="temporary-code-box">
              <strong>Código temporário de verificação:</strong>
              <div class="temporary-code">{{ temporaryVerificationCode }}</div>
              <small>Use esse código na aba "Verificar email".</small>
            </div>
          </div>

          <div v-else>
            <h2>Verificar email</h2>
            <p class="auth-subtitle">
              Digite o email e o código de 6 dígitos recebido no cadastro.
            </p>

            <div class="field">
              <label>Email</label>
              <input
                v-model="verificationEmail"
                type="email"
                placeholder="seuemail@exemplo.com"
              />
            </div>

            <div class="field">
              <label>Código de verificação</label>
              <input
                v-model="verificationCode"
                maxlength="6"
                placeholder="Digite os 6 dígitos"
              />
            </div>

            <button class="main-btn" @click="verifyCode">Verificar email</button>
            <button class="secondary-inline-btn" @click="resendCode">
              Reenviar código
            </button>

            <div v-if="temporaryVerificationCode" class="temporary-code-box">
              <strong>Novo código temporário:</strong>
              <div class="temporary-code">{{ temporaryVerificationCode }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="app-shell">
        <aside class="sidebar">
          <div class="brand">
            <div class="brand-icon">+</div>
            <div>
              <h2>Clínica Vida</h2>
              <p>{{ userRole === 'secretario' ? 'Painel do Secretário' : 'Painel do Paciente' }}</p>
            </div>
          </div>

          <nav class="menu">
  <button
    class="menu-item"
    :class="{ active: currentView === 'agenda' }"
    @click="currentView = 'agenda'"
  >
    {{ userRole === 'secretario' ? 'Gerenciar Agenda' : 'Agendar Consulta' }}
  </button>

  <button
    v-if="userRole === 'secretario'"
    class="menu-item"
    :class="{ active: currentView === 'pacientes' }"
    @click="currentView = 'pacientes'"
  >
    Usuários
  </button>

  <button
    class="menu-item"
    :class="{ active: currentView === 'atendimentos' }"
    @click="currentView = 'atendimentos'"
  >
    {{ userRole === 'secretario' ? 'Todos Atendimentos' : 'Meus Atendimentos' }}
  </button>
</nav>

          <button class="logout-btn" @click="logout">Sair</button>
        </aside>

        <main class="content">
          <header class="topbar">
            <div>
              <h1>Sistema de Agendamento</h1>
              <p>
                {{
                  userRole === 'secretario'
                    ? 'Você está visualizando todos os agendamentos da clínica'
                    : 'Você está visualizando apenas seus agendamentos'
                }}
              </p>
            </div>

            <div class="topbar-badge">
              {{ userName }} • {{ userRole }}
            </div>
          </header>

          <template v-if="currentView === 'agenda'">
            <div class="grid-layout">
              <section class="card">
                <div class="section-header">
                  <h2>
                    {{ userRole === 'secretario' ? 'Gerenciar Consultas' : 'Nova Consulta' }}
                  </h2>
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

                <button class="main-btn schedule-btn" @click="agendar">
                  Agendar consulta
                </button>
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
                      <h4>{{ a.patientName || a.patient?.name || 'Paciente' }}</h4>
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

          <template v-else-if="currentView === 'pacientes' && userRole === 'secretario'">
  <section class="card">
    <div class="section-header">
      <h2>Pacientes</h2>
      <span class="muted">Área administrativa</span>
    </div>

    <div class="info-grid">
      <div class="info-card">
        <span class="info-label">Modo do sistema</span>
        <strong>Secretário</strong>
      </div>

      <div class="info-card">
        <span class="info-label">Consultas carregadas</span>
        <strong>{{ lista.length }}</strong>
      </div>

      <div class="info-card">
        <span class="info-label">Controle</span>
        <strong>Visualização completa</strong>
      </div>
    </div>


              <div class="info-grid">
                <div class="info-card">
                  <span class="info-label">Usuário logado</span>
                  <strong>{{ userName || 'Não identificado' }}</strong>
                </div>

                <div class="info-card">
                  <span class="info-label">Tipo de usuário</span>
                  <strong>{{ userRole || 'Não identificado' }}</strong>
                </div>

                <div class="info-card">
                  <span class="info-label">Consultas visíveis</span>
                  <strong>{{ lista.length }}</strong>
                </div>
              </div>
            </section>
          </template>

          <template v-else-if="currentView === 'atendimentos'">
            <section class="card">
              <div class="section-header">
                <h2>Atendimentos</h2>
                <p style="margin-bottom: 15px; color:#64748b;">
  {{
    userRole === 'secretario'
      ? 'Visualizando todos os atendimentos da clínica'
      : 'Visualizando apenas seus atendimentos'
  }}
</p>
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
                    <th v-if="userRole === 'secretario'">Ações</th>
                  </tr>
                    </thead>
                  <tbody>
                    <tr v-for="a in lista" :key="a._id">
                      <td>{{ a.patientName || a.patient?.name || 'Paciente' }}</td>
                      <td>{{ formatOnlyDate(a.date) }}</td>
                      <td>{{ formatOnlyTime(a.date) }}</td>
                      <td>{{ a.address || 'Não informado' }}</td>
                      <td>{{ a.patient?.email || 'Não disponível' }}</td>
                      <td v-if="userRole === 'secretario'">
                      <button class="danger-btn" @click="cancelar(a._id)">
                      Cancelar
                      </button>
                      </td>
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
      authMode: 'login',
      currentView: 'agenda',

      email: '',
      password: '',

      registerName: '',
      registerEmail: '',
      registerPassword: '',
      registerRole: 'paciente',

      verificationEmail: '',
      verificationCode: '',
      temporaryVerificationCode: '',

      token: localStorage.getItem('token') || '',
      userRole: localStorage.getItem('userRole') || '',
      userName: localStorage.getItem('userName') || '',

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
    changeAuthMode(mode) {
      this.authMode = mode
    },

    async register() {
      try {
        const response = await api.post('/auth/register', {
          name: this.registerName,
          email: this.registerEmail,
          password: this.registerPassword,
          role: this.registerRole
        })

        this.temporaryVerificationCode = response.data.verificationCode || ''
        this.verificationEmail = this.registerEmail
        this.authMode = 'verify'

        alert('Usuário cadastrado com sucesso. Agora verifique o email com o código informado.')
      } catch (error) {
        alert(error.response?.data?.msg || 'Erro ao cadastrar usuário')
      }
    },

    async verifyCode() {
      try {
        await api.post('/auth/verify-email-code', {
          email: this.verificationEmail,
          code: this.verificationCode
        })

        this.email = this.verificationEmail
        this.password = this.registerPassword || this.password
        this.authMode = 'login'
        this.temporaryVerificationCode = ''

        alert('Email verificado com sucesso! Agora faça login.')
      } catch (error) {
        alert(error.response?.data?.msg || 'Erro ao verificar código')
      }
    },

    async resendCode() {
      try {
        const response = await api.post('/auth/resend-verification-code', {
          email: this.verificationEmail
        })

        this.temporaryVerificationCode = response.data.verificationCode || ''

        alert('Código reenviado com sucesso.')
      } catch (error) {
        alert(error.response?.data?.msg || 'Erro ao reenviar código')
      }
    },

    async login() {
      try {
        const response = await api.post('/auth/login', {
          email: this.email,
          password: this.password
        })

        this.token = response.data.token
        this.userRole = response.data.user.role
        this.userName = response.data.user.name

        localStorage.setItem('token', this.token)
        localStorage.setItem('userRole', this.userRole)
        localStorage.setItem('userName', this.userName)

        alert('Login realizado com sucesso!')
        this.carregar()
      } catch (error) {
        alert(error.response?.data?.msg || 'Erro ao fazer login')
      }
    },

    logout() {
      this.token = ''
      this.userRole = ''
      this.userName = ''
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userName')
      this.currentView = 'agenda'
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
    const dateISO = this.buildDate()

    const clima = await api.get('/external/weather/' + dateISO)

    if (clima.data.rain) {
      alert('⚠️ Atenção: Há previsão de chuva no dia da consulta!')
    }

    await api.post(
      '/appointments',
      {
        patientName: this.patientName || this.userName,
        date: dateISO,
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
    alert(error.response?.data?.msg || 'Erro ao agendar consulta')
  }
}
          {
            headers: {
              Authorization: this.token
            }
          }
        )

        alert('Consulta agendada com sucesso!')
        this.carregar()
      } catch (error) {
        alert(error.response?.data?.msg || 'Erro ao agendar consulta')
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
    async cancelar(id) {
  if (!confirm('Deseja cancelar essa consulta?')) return

  try {
    await api.delete(`/appointments/${id}`, {
      headers: {
        Authorization: this.token
      }
    })

    alert('Consulta cancelada com sucesso')
    this.carregar()
  } catch (error) {
    alert(error.response?.data?.msg || 'Erro ao cancelar consulta')
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
  font-family: Inter, Arial, Helvetica, sans-serif;
}

body {
  margin: 0;
  background: #f6f8fa;
  color: #1f2328;
}

.page {
  min-height: 100vh;
}

.auth-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}

.auth-brand {
  text-align: center;
  margin-bottom: 24px;
}

.logo {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #0f172a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 30px;
  font-weight: bold;
}

.auth-brand h1 {
  margin: 0;
  font-size: 28px;
}

.auth-brand p {
  margin: 8px 0 0;
  color: #656d76;
}

.auth-card {
  width: 100%;
  max-width: 430px;
  background: #ffffff;
  border: 1px solid #d0d7de;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(16, 24, 40, 0.08);
}

.auth-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}

.tab-btn {
  border: 1px solid #d0d7de;
  background: #f6f8fa;
  color: #24292f;
  border-radius: 8px;
  padding: 10px 12px;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
}

.tab-btn.active {
  background: #0f172a;
  color: white;
  border-color: #0f172a;
}

.auth-card h2 {
  margin: 0 0 8px;
  font-size: 22px;
}

.auth-subtitle {
  margin: 0 0 20px;
  color: #656d76;
  font-size: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

label {
  font-size: 14px;
  font-weight: 600;
  color: #24292f;
}

input,
select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  outline: none;
}

input:focus,
select:focus {
  border-color: #0969da;
  box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.15);
}

.main-btn {
  width: 100%;
  border: 1px solid rgba(27, 31, 36, 0.15);
  background: #1f883d;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 4px;
}

.main-btn:hover {
  background: #1a7f37;
}

.secondary-inline-btn {
  width: 100%;
  border: 1px solid #d0d7de;
  background: #f6f8fa;
  color: #24292f;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
}

.temporary-code-box {
  margin-top: 16px;
  padding: 14px;
  background: #fff8c5;
  border: 1px solid #eac54f;
  border-radius: 10px;
}

.temporary-code {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 6px;
  margin: 8px 0;
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

.logout-btn {
  width: 100%;
  margin-top: 24px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: transparent;
  color: white;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
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

.form-grid {
  display: grid;
  gap: 16px;
}

.two-columns {
  grid-template-columns: 1fr 1fr;
}

.field.full {
  grid-column: 1 / -1;
}

input[readonly] {
  opacity: 1;
  cursor: default;
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

.schedule-btn {
  margin-top: 20px;
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
  .danger-btn {
  border: none;
  background: #dc2626;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.danger-btn:hover {
  background: #b91c1c;
}
</style>
