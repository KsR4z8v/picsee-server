function verificationCode(username, verifyCode) {
    return `<html>
              <body style="font-family: Arial, sans-serif;  background-color: #f2f2f2; padding: 20px;">
              <p style="text-align:center; font-size:30px;" > Hola ${username}.</p>
              <p style="text-align:center; font-size: 15px;">Tu codigo de verificacion:</p>
              <div style="height:min-content; width:100%; background: white; color:black; text-align:center; font-size:30px"> <b>${verifyCode}</b></div>
              <p style="font-size: 11px;">Recuerda que no debes compartir este codigo con nadie.</p>
              <p style=" text-align:center; font-size: 10px; color: #999999;">Snapwire</p>
              </body>
           </html>`;
}

function resetPassword(
    username,
    token,
    redirectToLink
) {
    return `
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Recuperación de Contraseña</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f6f6f6;
        color: #303030;
        margin: 0;
        padding: 0;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: auto;
        background: #ffffff;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background-color: #1e202c;
        color: white;
        padding: 20px;
        text-align: center;
      }
      .content {
        padding: 20px;
      }
      .content p {
        font-size: 16px;
        line-height: 1.5;
      }
      .button {
        display: inline-block;
        padding: 10px 20px;
        margin-top: 20px;
        text-align: center;
        box-sizing: border-box;
        width: 100%;
        background-color: #1e202c;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
      }
      .footer {
        text-align: center;
        padding: 20px;
        font-size: 12px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Recupera Tu Contraseña</h1>
      </div>
      <div class="content">
        <p>Hola SODHKSJF,</p>
        <p>
          Has solicitado restablecer tu contraseña. Para continuar, haz clic en
          el siguiente botón
        </p>
        <a href="${redirectToLink}?t=${token}" class="button"
          >Restablecer Contraseña</a
        >
        <p>Si no solicitaste este cambio, ignora este correo.</p>
        <p>Gracias,</p>
        <p>El equipo de Picsee.</p>
      </div>
      <div class="footer">
        <p>&copy; 2024 picsee. Todos los derechos reservados.</p>
      </div>
    </div>
  </body>
</html>

`;
}

module.exports = {
    resetPassword,
    verificationCode
}