using AngularAuthAPI.Models;

namespace AngularAuthAPI.UtlityServices
{
    public interface IEmailService
    {
        void SendEmail(EmailModel emailModel);
    }
}
