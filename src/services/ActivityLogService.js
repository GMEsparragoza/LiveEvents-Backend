import ActivityLog from "../models/ActivityLog.js";
import { UAParser } from 'ua-parser-js'

const logActivity = async (id, action, details, req) => {
    try {
        const parser = new UAParser(req.headers["user-agent"]);
        const device = parser.getDevice(); // Marca y modelo del dispositivo
        const os = parser.getOS(); // Sistema operativo
        const browser = parser.getBrowser(); // Navegador

        let simplifiedUserAgent = `${os.name} ${os.version} - ${browser.name} ${browser.version}`;

        // Si el dispositivo tiene nombre (como un móvil o tablet), lo añadimos
        if (device.vendor && device.model) {
            simplifiedUserAgent = `${device.vendor} ${device.model} - ${simplifiedUserAgent}`;
        }

        await ActivityLog.create({
            userID: id,
            action,
            details,
            ipAddress: req.ip, // Obtener dirección IP real del usuario
            userAgent: simplifiedUserAgent, // Obtener información del navegador/dispositivo
        });
    } catch (error) {
        throw new Error("Error logging activity:", error);
    }
};

export default logActivity