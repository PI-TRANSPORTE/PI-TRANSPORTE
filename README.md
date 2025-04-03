# Aplicação Web para Gerenciar e Compartilhar Rotas de Transporte Escolar

## Execução inicial do projeto

Observação: para seguir os passos abaixo é preciso que você tenha o **Node.js**, o **npm**, e o **MySQL** instalados em seu computador. Além disso, também é necessário que você crie um arquivo chamado **.env** dentro da pasta backend. Este arquivo .env deverá ter um conteúdo com a seguinte estrutura:
>   DB_HOST=*nome_do_host*  
    DB_USER=*nome_de_usuário*  
    DB_PASSWORD=*senha*  
    DB_NAME=*nome_do_banco_de_dados*  
- Observação: estes dados se referem ao seu banco de dados, por isso substitua os dados dos campos pelos dados corretos;
- Cada um destes campos é chamado de "variável de ambiente";

### Front-end

1. No terminal, acesse a pasta **frontend**, e execute:
    > **npm install**
    - Este comando instala as ferramentas de que o front-end depende para funcionar;

2. Ainda no terminal, digite e execute:
    > **ng serve --open**
    - Este comando faz o projeto rodar;

2. Espere um pouco, e, no navegador, acesse: http://localhost:4200.


### Back-end

1. No terminal, acesse a pasta **backend**, e digite e execute:
    > **npm install**
    - Este comando instala as ferramentas de que o back-end depende para funcionar;

2. Ainda no terminal, digite e execute:
    > **npm start**
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
    > {  
        "shift": "manhã",  
        "name": "Doug Funnie",  
        "street": "Rua X",  
        "strt_number": "7",  
        "district": "Bairro Y",  
        "city": "Cidade J"  
      }
