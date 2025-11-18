"""
Serviço de Envio de Emails
"""
from datetime import datetime, timedelta
from typing import Optional
import secrets
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib

from app.core.config import settings
from app.core.security import criar_token_acesso


class EmailService:
    """Serviço para envio de emails"""

    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.smtp_from = settings.SMTP_FROM or settings.SMTP_USER

    def _enviar_email(
        self,
        destinatario: str,
        assunto: str,
        corpo_html: str,
        corpo_texto: Optional[str] = None
    ):
        """
        Envia um email

        Args:
            destinatario: Email do destinatário
            assunto: Assunto do email
            corpo_html: Corpo do email em HTML
            corpo_texto: Corpo do email em texto plano (opcional)
        """
        # Se SMTP não configurado, apenas loga
        if not self.smtp_host or not self.smtp_user:
            print(f"[EMAIL] Enviaria email para {destinatario}")
            print(f"[EMAIL] Assunto: {assunto}")
            print(f"[EMAIL] Corpo:\n{corpo_texto or corpo_html}")
            return

        # Criar mensagem
        msg = MIMEMultipart('alternative')
        msg['Subject'] = assunto
        msg['From'] = self.smtp_from
        msg['To'] = destinatario

        # Adicionar corpo texto plano
        if corpo_texto:
            part1 = MIMEText(corpo_texto, 'plain', 'utf-8')
            msg.attach(part1)

        # Adicionar corpo HTML
        part2 = MIMEText(corpo_html, 'html', 'utf-8')
        msg.attach(part2)

        # Enviar email
        try:
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
        except Exception as e:
            print(f"[EMAIL ERROR] Erro ao enviar email: {str(e)}")
            # Em produção, você deve logar este erro adequadamente

    def enviar_recuperacao_senha(
        self,
        email: str,
        nome: str,
        token_recuperacao: str
    ):
        """
        Envia email de recuperação de senha

        Args:
            email: Email do usuário
            nome: Nome do usuário
            token_recuperacao: Token JWT de recuperação
        """
        # URL de redefinição (ajustar conforme frontend)
        url_reset = f"http://localhost:3000/redefinir-senha?token={token_recuperacao}"

        # Corpo em HTML
        corpo_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background-color: #1976d2;
                    color: white;
                    padding: 20px;
                    text-align: center;
                }}
                .content {{
                    background-color: #f9f9f9;
                    padding: 20px;
                    border: 1px solid #ddd;
                }}
                .button {{
                    display: inline-block;
                    padding: 12px 24px;
                    margin: 20px 0;
                    background-color: #1976d2;
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                }}
                .footer {{
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Sistema Tributec</h1>
                </div>
                <div class="content">
                    <h2>Olá, {nome}!</h2>
                    <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
                    <p>Para criar uma nova senha, clique no botão abaixo:</p>
                    <center>
                        <a href="{url_reset}" class="button">Redefinir Senha</a>
                    </center>
                    <p>Ou copie e cole o seguinte link no seu navegador:</p>
                    <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd;">
                        {url_reset}
                    </p>
                    <p><strong>Este link expira em 1 hora.</strong></p>
                    <p>Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá inalterada.</p>
                </div>
                <div class="footer">
                    <p>Sistema de Gestão Tributária Municipal - Tributec</p>
                    <p>Este é um email automático. Por favor, não responda.</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Corpo em texto plano
        corpo_texto = f"""
        Olá, {nome}!

        Recebemos uma solicitação para redefinir a senha da sua conta no Sistema Tributec.

        Para criar uma nova senha, acesse o link abaixo:
        {url_reset}

        Este link expira em 1 hora.

        Se você não solicitou a redefinição de senha, ignore este email.

        ---
        Sistema de Gestão Tributária Municipal - Tributec
        """

        self._enviar_email(
            destinatario=email,
            assunto="Recuperação de Senha - Sistema Tributec",
            corpo_html=corpo_html,
            corpo_texto=corpo_texto
        )

    def enviar_confirmacao_alteracao_senha(
        self,
        email: str,
        nome: str
    ):
        """
        Envia email de confirmação de alteração de senha

        Args:
            email: Email do usuário
            nome: Nome do usuário
        """
        corpo_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background-color: #4caf50;
                    color: white;
                    padding: 20px;
                    text-align: center;
                }}
                .content {{
                    background-color: #f9f9f9;
                    padding: 20px;
                    border: 1px solid #ddd;
                }}
                .footer {{
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✓ Senha Alterada</h1>
                </div>
                <div class="content">
                    <h2>Olá, {nome}!</h2>
                    <p>Sua senha foi alterada com sucesso em {datetime.now().strftime('%d/%m/%Y às %H:%M')}.</p>
                    <p>Se você não realizou esta alteração, entre em contato com o administrador do sistema imediatamente.</p>
                </div>
                <div class="footer">
                    <p>Sistema de Gestão Tributária Municipal - Tributec</p>
                </div>
            </div>
        </body>
        </html>
        """

        corpo_texto = f"""
        Olá, {nome}!

        Sua senha foi alterada com sucesso em {datetime.now().strftime('%d/%m/%Y às %H:%M')}.

        Se você não realizou esta alteração, entre em contato com o administrador do sistema imediatamente.

        ---
        Sistema de Gestão Tributária Municipal - Tributec
        """

        self._enviar_email(
            destinatario=email,
            assunto="Senha Alterada - Sistema Tributec",
            corpo_html=corpo_html,
            corpo_texto=corpo_texto
        )

    @staticmethod
    def gerar_token_recuperacao(email: str) -> str:
        """
        Gera um token JWT para recuperação de senha

        Args:
            email: Email do usuário

        Returns:
            Token JWT válido por 1 hora
        """
        return criar_token_acesso(
            dados={"sub": email, "tipo": "recuperacao"},
            expira_em=timedelta(hours=1)
        )
