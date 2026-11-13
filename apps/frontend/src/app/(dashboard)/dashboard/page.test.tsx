/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const makeSummary = (overrides: Partial<any> = {}) => ({
  almacen: {
    totalAssets: 42,
    byStatus: { BUENO: 35, EN_MANTENIMIENTO: 5, BAJA: 2 },
    transfersPending: 1,
    recentMovements: [],
  },
  farmacia: {
    totalProducts: 20,
    expiringLots: 3,
    quarantineLots: 1,
    lowStockProducts: 2,
    recentDispensations: [],
  },
  sistemas: {
    totalTechAssets: 10,
    openTickets: 5,
    ticketsByPriority: { ALTA: 3, MEDIA: 2 },
    scheduledMaintenances: 2,
    expiringLicenses: 0,
  },
  generatedAt: new Date().toISOString(),
  ...overrides,
});

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // never resolves
    render(<DashboardPage />);
    expect(screen.getByText(/cargando dashboard/i)).toBeInTheDocument();
  });

  it('renders KPI sections after data loads', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(makeSummary()) });
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument(); // totalAssets
    });
    expect(screen.getByText('20')).toBeInTheDocument(); // totalProducts
    expect(screen.getByText('10')).toBeInTheDocument(); // totalTechAssets
  });

  it('renders section headings for all three modules', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(makeSummary()) });
    render(<DashboardPage />);

    await waitFor(() => screen.getByText(/almacén/i));
    expect(screen.getByText(/farmacia/i)).toBeInTheDocument();
    expect(screen.getByText(/sistemas tic/i)).toBeInTheDocument();
  });

  it('shows priority breakdown when there are open tickets', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(makeSummary()) });
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/tickets por prioridad/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/ALTA: 3/)).toBeInTheDocument();
  });

  it('does NOT render priority section when openTickets is 0', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve(
          makeSummary({ sistemas: { totalTechAssets: 5, openTickets: 0, ticketsByPriority: {}, scheduledMaintenances: 0, expiringLicenses: 0 } }),
        ),
    });
    render(<DashboardPage />);

    await waitFor(() => screen.getByText('5')); // totalTechAssets
    expect(screen.queryByText(/tickets por prioridad/i)).not.toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(null) });
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/no se pudo cargar/i)).toBeInTheDocument();
    });
  });
});
