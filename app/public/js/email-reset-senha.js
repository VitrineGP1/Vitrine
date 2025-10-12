module.exports = (url, token)=>{

    return `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Senha</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      background-color: #ffffff;
      margin: 10px auto;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      max-width: 600px;
    }
    .header {
      background-color: #007bff;
      color: white;
      padding: 10px 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      padding: 20px;
      text-align: center;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      margin: 10px 0;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 5px;
    }
    .footer {
      padding: 10px 0;
      text-align: center;
      font-size: 12px;
      color: #777777;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bem-vindo(a)!</h1>
    </div>
    <div class="content">
      <p>Clique no botão abaixo para resetar sua senha:</p>
      <a href="$(url)/resetar-senha?token=$(token)" class="button">Resetar Senha</a>
    </div>
    <div class="footer">
      <p>Se você não solicitou isso, ignore este e-mail.</p>
    </div>
  </div>
</body>
</html>
    `
}