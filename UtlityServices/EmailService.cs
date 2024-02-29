using AngularAuthAPI.Models;
using MailKit.Net.Smtp;
using MimeKit;

namespace AngularAuthAPI.UtlityServices
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public void SendEmail(EmailModel emailModel)
        {
            var emailMessage = new MimeMessage();
            var from = _configuration["EmailSettings:From"];
            emailMessage.From.Add(new MailboxAddress("Pavan Kumar", from));
            emailMessage.To.Add(new MailboxAddress(emailModel.To, emailModel.To));
            emailMessage.Subject=emailModel.Subject;
            emailMessage.Body = new TextPart(MimeKit.Text.TextFormat.Html)
            {
                Text=string.Format(emailModel.Content)
            };
            using(var client=new SmtpClient())
            {
                try
                {
                    client.Connect(_configuration["EmailSettings:SmtpServer"], Convert.ToInt32(_configuration["EmailSettings:Port"]), true);
                    client.Authenticate(_configuration["EmailSettings:Username"], _configuration["EmailSettings:Password"]);
                    client.Send(emailMessage);
                }
                catch(Exception ex)
                {
                    throw;
                }
                finally
                {
                    client.Disconnect(true);
                    client.Dispose();
                }
            }
        }
    }
}
