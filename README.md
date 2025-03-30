# Aplicação Web para Gerenciar e Compartilhar Rotas de Transporte Escolar

## Execução inicial do projeto

Observação: para seguir os passos abaixo é preciso que você tenha Angular, Node.js, e npm instalados em seu computador.

### Front-end

1. No terminal, acesse a pasta **frontend**, e execute:
> npm install
    - Este comando instala as ferramentas de que o front-end depende para funcionar;

2. Ainda no terminal, digite e execute:
> ng serve --open
    - Este comando faz o projeto rodar;

2. Espere um pouco, e, no navegador, acesse: http://localhost:4200.


### Back-end

1. No terminal, acesse a pasta **backend**, e digite e execute:
> npm install
    - Este comando instala as ferramentas de que o back-end depende para funcionar;

2. Ainda no terminal, digite e execute:
> npm start
    - Este comando faz o projeto rodar;

3. Espere um pouco, e, no navegador, acesse: http://localhost:3000.


Se qualquer destes passos não funcionar para você, não se desespere :); veja as mensagens de erro, e procure entender o que aconteceu. E se mesmo assim não der certo, procure ajuda.


## API

### GET

- **api/students**
    - Retorna todos os alunos

- **api/students/:shift**
    - Retorna os alunos de um turno específico, que pode ser: manhã, tarde, ou noite

### POST

- **api/students**
    - Adiciona um novo aluno
    - corpo da requisição:
    > { "shift": "manhã", "name": "Doug Funnie", "street": "Rua X", "strt_number": "7", "district": "Bairro Y", "city": "Cidade J" }
