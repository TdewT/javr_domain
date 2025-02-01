namespace Core.Interfaces;

public interface IExecutableServer
{
    // Starts the server
    void Start();
    // Stops the server
    void Stop();
    // Reads output of the server console
    void HandleOutput();
}