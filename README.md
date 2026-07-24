# LumenSoft Point of Sale (POS) System

This workspace is split into two top-level folders:

- [frontend](frontend) contains the Vite React app.
- [backend](backend) contains the ASP.NET Core API project.

## Run It

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend/LumensoftPosApi
dotnet run
```

## Notes

The frontend API client points to `http://localhost:5298/api`, matching the backend launch profile in [backend/LumensoftPosApi/Properties/launchSettings.json](backend/LumensoftPosApi/Properties/launchSettings.json).


