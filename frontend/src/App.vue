<template>
<div>
<h2>Login</h2>
<input v-model="email"/><input v-model="password"/><button @click="login">Login</button>

<h2>Agendar</h2>
<input v-model="date" type="datetime-local"/>
<input v-model="cep" placeholder="CEP" @blur="buscarCep"/>
<p>{{endereco}}</p>
<button @click="agendar">Agendar</button>

<h2>Painel</h2>
<ul><li v-for="a in lista">{{a.date}} - {{a.patient?.email}}</li></ul>
</div>
</template>

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
