import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
export declare function initSocketServer(httpServer: HttpServer): Server;
export declare function getIO(): Server;
export declare function getRestaurantNamespace(): import("socket.io").Namespace<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
//# sourceMappingURL=socket.d.ts.map