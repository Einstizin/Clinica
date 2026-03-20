<template>
  <div class="page">
    <div class="card">
      <h1>Sistema da Clínica</h1>

      <section>
        <h2>Login</h2>
        <div class="row">
          <input v-model="email" placeholder="Email" />
          <input v-model="password" type="password" placeholder="Senha" />
          <button @click="login">Login</button>
        </div>
      </section>

      <section>
        <h2>Agendar Consulta</h2>
        <div class="row">
          <input v-model="date" type="datetime-local" />
          <input v-model="cep" placeholder="CEP" @blur="buscarCep" />
        </div>
        <p class="address"><strong>Endereço:</strong> {{ endereco || 'Não informado' }}</p>
        <button @click="agendar">Agendar</button>
      </section>

      <section>
        <h2>Painel</h2>
        <ul v-if="lista.length">
          <li v-for="a in lista" :key="a._id">
            {{ formatDate(a.date) }} - {{ a.patient?.email || 'Paciente' }}
          </li>
        </ul>
        <p v-else>Nenhuma consulta encontrada.</p>
      </section>
    </div>
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
      email: '',
      password: '',
      token: localStorage.getItem('token') || '',
      date: '',
      cep: '',
      endereco: '',
      lista: []
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
    async agendar() {
      try {
        await api.post(
          '/appointments',
          {
            date: this.date,
            address: this.endereco
          },
          {
            headers: { Authorization: this.token }
          }
        )
        alert('Consulta agendada com sucesso!')
        this.carregar()
      } catch (e) {
        alert('Erro ao agendar consulta')
      }
    },
    async carregar() {
      if (!this.token) return
      try {
        const r = await api.get('/appointments', {
          headers: { Authorization: this.token }
        })
        this.lista = r.data
      } catch (e) {
        this.lista = []
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
  font-family: Arial, sans-serif;
}

body {
  margin: 0;
  background: #f4f7fb;
}

.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px;
}

.card {
  width: 100%;
  max-width: 800px;
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

h1 {
  margin-top: 0;
  color: #1f3c88;
  text-align: center;
}

h2 {
  margin-bottom: 12px;
  color: #333;
}

section {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

input {
  flex: 1;
  min-width: 180px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

button {
  padding: 12px 18px;
  background: #1f3c88;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

button:hover {
  background: #16306d;
}

.address {
  margin: 12px 0;
  color: #555;
}

ul {
  padding-left: 18px;
}

li {
  margin-bottom: 8px;
}
</style>

<script>
import axios from 'axios';
export default{
data(){return{email:'',password:'',token:'',date:'',cep:'',endereco:'',lista:[]}},
methods:{
async login(){
const r=await axios.post('https://clinica-wkzp.onrender.com/auth/login',{email:this.email,password:this.password});
this.token=r.data.token;},
async agendar(){
await axios.post('https://clinica-wkzp.onrender.com/appointments',{date:this.date,address:this.endereco},{
headers:{Authorization:this.token}});
alert('ok');this.carregar();},
async carregar(){
const r=await axios.get('https://clinica-wkzp.onrender.com/appointments',{headers:{Authorization:this.token}});
this.lista=r.data;},
async buscarCep(){
const r=await axios.get('https://clinica-wkzp.onrender.com/external/cep/'+this.cep);
this.endereco=r.data.logradouro;}
},
mounted(){this.carregar();}
}
</script>
