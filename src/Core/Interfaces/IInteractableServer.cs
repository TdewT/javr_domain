namespace Core.Interfaces;

public interface IInteractableServer
{
    // Sends input to the server
    void SendCommand(string command);
}