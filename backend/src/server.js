import app from "./app.js";

const port = 3000;

const studentExample = {
	shift: 'noite',
	name: 'Doug Funnie',
	street: 'Rua dos Jacarandás',
	strt_number: '0',
	district: 'Corruíra dourada',
	city: 'Campinas'
}


app.listen(port, () => {
	console.log(`O server está rodando na porta ${port}!`);
});


