import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// Fallback initial data in case the file doesn't exist
const DEFAULT_VEHICLES = [
  {
    interno: "47062",
    vin: "TM018913",
    vehiculo: "Vento GLI 350TSI DSG G2 MY26",
    color: "Gris Artico",
    recepcion: "14/05/2026",
    pago: "NO PAGADO",
    boxUbicacion: "1-C-3",
    box: "1",
    ubicacion: "C-3",
    armadoPor: "",
    codRadio: "299",
    llave: "A",
    combustible: "✔",
    estado: "OK",
    informe: "OK",
    otroInforme: "CONTROL HERRERA 18/05/26",
    accesorios: "",
    exhibicion: "P / SL",
    preEntregado: "SALON LOMAS (02/06/2026)",
    viajes: "",
    manual: "⏹️",
    check: "⏺️",
    destinoActual: "LAS LOMAS",
    destinoTerminal: "Casa Central - Jujuy",
    facturado: "No",
    venta: "",
    vendedor: "",
    dominio: "",
    ordenes: "261163-C",
    controlRealizado: "OK",
    opState: "OK"
  },
  {
    interno: "47046",
    vin: "TM044787",
    vehiculo: "TAOS Comfortline 250TSI AT MY26",
    color: "DEEP BLACK PEARLE",
    recepcion: "14/05/2026",
    pago: "NO PAGADO",
    boxUbicacion: "2-C-3",
    box: "2",
    ubicacion: "C-3",
    armadoPor: "",
    codRadio: "1433",
    llave: "G /",
    combustible: "✘",
    estado: "OK",
    informe: "OK",
    otroInforme: "CONTROL HERRERA 20/05/26",
    accesorios: "",
    exhibicion: "",
    preEntregado: "",
    viajes: "",
    manual: "10",
    check: "",
    destinoActual: "LAS LOMAS",
    destinoTerminal: "Casa Central - Jujuy",
    facturado: "No",
    venta: "",
    vendedor: "",
    dominio: "",
    ordenes: "",
    controlRealizado: "OK",
    opState: "OK"
  },
  {
    interno: "38166",
    vin: "KT002264",
    vehiculo: "Voyage 1.6 - Trendline",
    color: "Blanco Cristal",
    recepcion: "22/02/2019",
    pago: "OK",
    boxUbicacion: "3-C-3-C",
    box: "3",
    ubicacion: "C-3-C",
    armadoPor: "",
    codRadio: "883",
    llave: "2️⃣",
    combustible: "✔",
    estado: "OK",
    informe: "OK",
    otroInforme: "",
    accesorios: "",
    exhibicion: "",
    preEntregado: "",
    viajes: "Planes / SI C. ELOY",
    manual: "🚗",
    check: "",
    destinoActual: "LAS LOMAS",
    destinoTerminal: "Casa Central - Jujuy",
    facturado: "Si",
    venta: "Jujuy",
    vendedor: "Planes Jujuy",
    dominio: "AD676ZS",
    ordenes: "14-C",
    controlRealizado: "OK",
    opState: "OK"
  },
  {
    interno: "46975",
    vin: "TP052116",
    vehiculo: "Nivus Outfit 200 TSI AT G1 MY 26",
    color: "MOONSTONE GRAY",
    recepcion: "04/05/2026",
    pago: "NO PAGADO",
    boxUbicacion: "6-C-3",
    box: "6",
    ubicacion: "C-3",
    armadoPor: "",
    codRadio: "1004",
    llave: "H",
    combustible: "✘",
    estado: "OK",
    informe: "OK",
    otroInforme: "CONTROL CONRADO 08/05 26 // LAVADO MATIAS 15/05",
    accesorios: "",
    exhibicion: "P / SL",
    preEntregado: "",
    viajes: "",
    manual: "",
    check: "",
    destinoActual: "LAS LOMAS",
    destinoTerminal: "Casa Central - Jujuy",
    facturado: "No",
    venta: "",
    vendedor: "",
    dominio: "",
    ordenes: "261271-A",
    controlRealizado: "OK",
    opState: "OK"
  },
  {
    interno: "46934",
    vin: "SA041990",
    vehiculo: "Amarok Comfortline TDI AT 4X2 G2",
    color: "Pyrite Silver Metall",
    recepcion: "27/04/2026",
    pago: "OK",
    boxUbicacion: "7-C-1",
    box: "7",
    ubicacion: "C-1",
    armadoPor: "",
    codRadio: "-",
    llave: "🟦",
    combustible: "✘",
    estado: "UNIDAD REPARADA",
    informe: "39KM MARCA TRIP",
    otroInforme: "LAVADO 13/05 MATIAS // CONTROL CONRADO 19/05/26",
    accesorios: "",
    exhibicion: "",
    preEntregado: "",
    viajes: "MARKAS ORLANDO",
    manual: "",
    check: "",
    destinoActual: "LAS LOMAS",
    destinoTerminal: "Casa Central - Jujuy",
    facturado: "No",
    venta: "",
    vendedor: "",
    dominio: "",
    ordenes: "",
    controlRealizado: "OK",
    opState: "REVISAR"
  },
  {
    interno: "46882",
    vin: "T4062342",
    vehiculo: "T-CROSS TRENDLINE 200 TSI AT MY 26",
    color: "Sunset Red Metalic",
    recepcion: "08/04/2026",
    pago: "OK",
    boxUbicacion: "12-C-3-B",
    box: "12",
    ubicacion: "C-3-B",
    armadoPor: "",
    codRadio: "1655",
    llave: "A /",
    combustible: "✘",
    estado: "OK",
    informe: "OK",
    otroInforme: "CONTROL HERRERA 08/05/26 // LAVADO CLAUDIO 11/05/26",
    accesorios: "",
    exhibicion: "",
    preEntregado: "",
    viajes: "",
    manual: "❹",
    check: "",
    destinoActual: "LAS LOMAS",
    destinoTerminal: "Casa Central - Jujuy",
    facturado: "No",
    venta: "",
    vendedor: "",
    dominio: "",
    ordenes: "",
    controlRealizado: "OK",
    opState: "OK"
  },
  {
    interno: "46943",
    vin: "TP056571",
    vehiculo: "Nivus Comfortline 200 TSI AT MY 26",
    color: "Blanco Candy",
    recepcion: "20/04/2026",
    pago: "OK",
    boxUbicacion: "13-C-3",
    box: "13",
    ubicacion: "C-3",
    armadoPor: "",
    codRadio: "1926",
    llave: "K /",
    combustible: "✘",
    estado: "OK",
    informe: "OK",
    otroInforme: "CONTROL HERRERA 11/05 // LAVADO CLAUDIO 19/05/26",
    accesorios: "",
    exhibicion: "",
    preEntregado: "",
    viajes: "",
    manual: "❸",
    check: "",
    destinoActual: "LAS LOMAS",
    destinoTerminal: "Casa Central - Jujuy",
    facturado: "No",
    venta: "",
    vendedor: "",
    dominio: "",
    ordenes: "",
    controlRealizado: "OK",
    opState: "OK"
  },
  {
    interno: "46695",
    vin: "TT640947",
    vehiculo: "Polo Highline 170 TSI AT MY 26",
    color: "Gris Platinum Metali",
    recepcion: "09/01/2026",
    pago: "OK",
    boxUbicacion: "14-C-3",
    box: "14",
    ubicacion: "C-3",
    armadoPor: "",
    codRadio: "145",
    llave: "🟦",
    combustible: "✘",
    estado: "A REPARAR",
    informe: "PERDIDA DE ACEITE BAJO MOTOR // Reparado 20/03/26",
    otroInforme: "CONTROL HERRERA 13/05/26 // LAVADO CLAUDIO 20/05/26",
    accesorios: "",
    exhibicion: "",
    preEntregado: "",
    viajes: "MARKAS ORLANDO",
    manual: "",
    check: "",
    destinoActual: "LAS LOMAS",
    destinoTerminal: "Casa Central - Jujuy",
    facturado: "No",
    venta: "",
    vendedor: "",
    dominio: "",
    ordenes: "",
    controlRealizado: "OK",
    opState: "NOVEDAD"
  },
  {
    interno: "46993",
    vin: "SA043175",
    vehiculo: "Amarok Extreme V6 AT 4x4 G2",
    color: "INDIUM GRAY METAL",
    recepcion: "21/05/2026",
    pago: "OK",
    boxUbicacion: "15-C-2",
    box: "15",
    ubicacion: "C-2",
    armadoPor: "",
    codRadio: "",
    llave: "B",
    combustible: "✔",
    estado: "A REPARAR",
    informe: "Paragolpe trasero pisadera rayado lado derecho + del. faro adicional rayado",
    otroInforme: "",
    accesorios: "🔼",
    exhibicion: "",
    preEntregado: "",
    viajes: "directa / SI C. ELOY",
    manual: "⏺️",
    check: "⏺️",
    destinoActual: "LAS LOMAS",
    destinoTerminal: "Casa Central - Jujuy",
    facturado: "Si",
    venta: "Jujuy",
    vendedor: "Directa Jujuy",
    dominio: "AI300WQ",
    ordenes: "261031-C",
    controlRealizado: "NO",
    opState: "NOVEDAD"
  },
  {
    interno: "47014",
    vin: "TT656882",
    vehiculo: "Polo Comfortline 170 TSI AT MY 26",
    color: "Gris Platinum Metali",
    recepcion: "08/05/2026",
    pago: "NO PAGADO",
    boxUbicacion: "16-C-3",
    box: "16",
    ubicacion: "C-3",
    armadoPor: "",
    codRadio: "759",
    llave: "B /",
    combustible: "✘",
    estado: "OK",
    informe: "OK",
    otroInforme: "CONTROL CONRADO 13/05/26 // LAVADO MATIAS 28/05 // PRESTADO A TALLER",
    accesorios: "",
    exhibicion: "",
    preEntregado: "",
    viajes: "",
    manual: "❷",
    check: "",
    destinoActual: "LAS LOMAS",
    destinoTerminal: "Casa Central - Jujuy",
    facturado: "No",
    venta: "",
    vendedor: "",
    dominio: "",
    ordenes: "",
    controlRealizado: "OK",
    opState: "OK"
  },
  {
    interno: "46879",
    vin: "T4056499",
    vehiculo: "T-Cross Trendline 170TSI TL MT MY 26",
    color: "Negro Ninja",
    recepcion: "10/04/2026",
    pago: "OK",
    boxUbicacion: "17-C-3-B",
    box: "17",
    ubicacion: "C-3-B",
    armadoPor: "",
    codRadio: "951",
    llave: "A /",
    combustible: "✘",
    estado: "OK",
    informe: "OK",
    otroInforme: "CONTROL HERRERA 08/05/26 // LAVADO CLAUDIO 11/05/26",
    accesorios: "",
    exhibicion: "",
    preEntregado: "",
    viajes: "",
    manual: "❸",
    check: "",
    destinoActual: "LAS LOMAS",
    destinoTerminal: "Casa Central - Jujuy",
    facturado: "No",
    venta: "",
    vendedor: "",
    dominio: "",
    ordenes: "",
    controlRealizado: "OK",
    opState: "OK"
  }
];

const DEFAULT_API_KEY = "autosol_pdi_secret_token_2026";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to support JSON parsing & URL Encoding
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // Dynamic database file path
  const dataDir = path.join(process.cwd(), "data");
  const dbPath = path.join(dataDir, "inventory.json");

  // Ensure 'data' directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Ensure JSON database exists and populate on first start
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(DEFAULT_VEHICLES, null, 2), "utf-8");
    console.log("Database initialized and populated with default autosol stock.");
  }

  // Helper load/save functions
  const loadInventory = (): any[] => {
    try {
      const data = fs.readFileSync(dbPath, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading database file, returning fallback data:", err);
      return DEFAULT_VEHICLES;
    }
  };

  const saveInventory = (data: any[]): boolean => {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch (err) {
      console.error("Error writing database file:", err);
      return false;
    }
  };

  // API Middleware for Auth
  const apiAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const key = req.headers["x-api-key"] || req.query.api_key;
    const targetKey = process.env.VITE_EDIT_API_KEY || DEFAULT_API_KEY;

    if (key === targetKey) {
      return next();
    }
    // Allow GET requests without auth for app's preview, or fallback if request is internal
    const isGet = req.method === "GET";
    const isLocalRequest = req.headers.host && (req.headers.host.includes("localhost") || req.headers.host.includes("127.0.0.1") || req.headers.host.includes("3000"));

    if (isGet || isLocalRequest) {
      return next();
    }

    return res.status(401).json({ error: "No autorizado. Token API incorrecto o ausente." });
  };

  // --- API Routes ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Get full inventory
  app.get("/api/inventory", (req, res) => {
    const data = loadInventory();
    res.json(data);
  });

  // Get configuration info for sheets
  app.get("/api/inventory/config", (req, res) => {
    const apiKey = process.env.VITE_EDIT_API_KEY || DEFAULT_API_KEY;
    res.json({
      apiKey: apiKey,
      endpoint: "/api/inventory/sync"
    });
  });

  // Update a single car (VIN matched)
  app.post("/api/inventory/update", apiAuth, (req, res) => {
    const updatedCar = req.body;
    if (!updatedCar || !updatedCar.vin) {
      return res.status(400).json({ error: "VIN es requerido para la actualización." });
    }

    const inventory = loadInventory();
    const index = inventory.findIndex(c => c.vin.toUpperCase() === updatedCar.vin.toUpperCase());

    if (index === -1) {
      // Add as new instead of failing, extremely user friendly!
      inventory.push(updatedCar);
    } else {
      inventory[index] = { ...inventory[index], ...updatedCar };
    }

    saveInventory(inventory);
    res.json({ success: true, message: "Unidad actualizada correctamente", vehicle: updatedCar });
  });

  // Bulk synchronisation (replaces or maps from sheet)
  app.post("/api/inventory/sync", apiAuth, (req, res) => {
    const sheetData = req.body;
    if (!Array.isArray(sheetData)) {
      return res.status(400).json({ error: "Datos incorrectos. Se esperaba una lista de unidades." });
    }

    // Standardize fields to ensure property casing matches types.ts
    const mappedVehicles = sheetData.map((item: any) => {
      // Safely read properties whether they represent original uppercase names or lowercase camelCase names
      const getValue = (keys: string[]): string => {
        for (const k of keys) {
          if (item[k] !== undefined) return String(item[k]).trim();
        }
        return "";
      };

      const interno = getValue(["interno", "INTERNO", "Interno"]);
      const vin = getValue(["vin", "VIN", "Vin"]);
      const vehiculo = getValue(["vehiculo", "VEHICULO", "Vehiculo", "VEHÍCULO", "vehículo"]);
      const color = getValue(["color", "COLOR", "Color"]);
      const recepcion = getValue(["recepcion", "recepción", "F. DE RECEPCION", "F. DE RECEPCIÓN", "Recepcion"]);
      const pago = getValue(["pago", "F. DE PAGO", "Pago"]);
      const boxUbicacion = getValue(["boxUbicacion", "BOX Y UBICACIÓN", "BOX Y UBICACION", "BoxUbicacion"]);
      const box = getValue(["box", "Nº DE BOX", "No DE BOX", "Box"]);
      const ubicacion = getValue(["ubicacion", "ubícación", "UBICACIÓN", "UBICACION", "Ubicacion"]);
      const armadoPor = getValue(["armadoPor", "ARMADO POR", "ArmadoPor"]);
      const codRadio = getValue(["codRadio", "COD RADIO", "CodRadio"]);
      const llave = getValue(["llave", "LLAVE", "Llave"]);
      const combustible = getValue(["combustible", "COMBUSTIBLE", "Combustible"]);
      const estado = getValue(["estado", "ESTADO", "Estado"]);
      const informe = getValue(["informe", "INFORME DE LA UNIDAD", "Informe"]);
      const otroInforme = getValue(["otroInforme", "OTRO INFORME", "OtroInforme"]);
      const accesorios = getValue(["accesorios", "ACCESORIOS", "Accesorios"]);
      const exhibicion = getValue(["exhibicion", "exhibición", "EN EXHIBICION", "EN EXHIBICIóN", "Exhibicion"]);
      const preEntregado = getValue(["preEntregado", "PRE-ENTREGADO", "PRE-ENTRGADO", "PreEntregado"]);
      const viajes = getValue(["viajes", "VIAJES", "Viajes"]);
      const manual = getValue(["manual", "MANUAL", "Manual"]);
      const check = getValue(["check", "CHECK", "Check"]);
      const destinoActual = getValue(["destinoActual", "DESTINO ACTUAL", "DestinoActual"]);
      const destinoTerminal = getValue(["destinoTerminal", "DESTINO TERMINAL", "DestinoTerminal"]);
      const facturado = getValue(["facturado", "FACTURADO", "Facturado"]);
      const venta = getValue(["venta", "VENTA", "Venta"]);
      const vendedor = getValue(["vendedor", "VENDEDOR", "Vendedor"]);
      const dominio = getValue(["dominio", "DOMINIO", "Dominio"]);
      const ordenes = getValue(["ordenes", "Nº ORDENES", "No ORDENES", "Ordenes"]);
      const controlRealizado = getValue(["controlRealizado", "CONTROL REALIZADO", "ControlRealizado"]);

      // Define op status
      const descText = [estado, informe, otroInforme].join(" ").toLowerCase();
      let opState: "OK" | "NOVEDAD" | "REVISAR" = "OK";
      if (["a reparar", "reparar", "rayad", "aboll", "golpe", "faltante"].some(str => descText.includes(str))) {
        opState = "NOVEDAD";
      } else if (["unidad reparada", "revisar"].some(str => descText.includes(str))) {
        opState = "REVISAR";
      }

      return {
        interno,
        vin: vin || Math.random().toString(36).substr(2, 8).toUpperCase(),
        vehiculo: vehiculo || "Vehículo sin nombre",
        color,
        recepcion,
        pago,
        boxUbicacion,
        box,
        ubicacion: ubicacion || "SIN DATO",
        armadoPor,
        codRadio,
        llave,
        combustible,
        estado: estado || "OK",
        informe,
        otroInforme,
        accesorios,
        exhibicion,
        preEntregado,
        viajes,
        manual,
        check,
        destinoActual,
        destinoTerminal,
        facturado,
        venta,
        vendedor,
        dominio,
        ordenes,
        controlRealizado,
        opState
      };
    });

    saveInventory(mappedVehicles);
    res.json({
      success: true,
      message: `Sincronización masiva completada exitosamente. ${mappedVehicles.length} unidades actualizadas.`,
      count: mappedVehicles.length
    });
  });

  // Delete a single vehicle
  app.delete("/api/inventory/:vin", apiAuth, (req, res) => {
    const vin = req.params.vin;
    const inventory = loadInventory();
    const filtered = inventory.filter(c => c.vin.toUpperCase() !== vin.toUpperCase());

    if (inventory.length === filtered.length) {
      return res.status(404).json({ error: "No se encontró ningún vehículo con el VIN especificado." });
    }

    saveInventory(filtered);
    res.json({ success: true, message: "Vehículo eliminado del stock correctamente." });
  });

  // --- End of API ---

  // Vite development or production build orchestration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Started Vite Server middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on port ${PORT}`);
  });
}

startServer();
