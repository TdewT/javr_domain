using System.Threading;

namespace Core.Interfaces;

public interface IGameServer
{
    // Method that updates state of the game server
    protected void UpdateStatus();
    
    // Periodic check invoking UpdateStatus() method.
    // Semaphore to avoid overloading network.
    void StartStatusMonitor(SemaphoreSlim gate);
}