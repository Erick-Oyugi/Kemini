// services/telemetrySocket.ts
import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

export const initTelemetrySockets = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to telemetry stream: ${socket.id}`);

    // Join room for specific vehicle
    socket.on('subscribe_vehicle', (vehicleId: string) => {
      socket.join(vehicleId);
      console.log(`Subscribed to telemetry for ${vehicleId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Example function triggered by IoT MQTT message ingestion:
  return {
    broadcastTelemetryUpdate: (vehicleId: string, updatedStats: object) => {
      io.to(vehicleId).emit('telemetry_update', updatedStats);
    },
  };
};