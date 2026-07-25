-- ============================================
-- LIMPIAR HISTORIAL para entregar la app
-- Borra ventas, pagos y movimientos de stock.
-- Los productos (perfumes) y sus fotos NO se tocan.
-- ¡Esto no se puede deshacer!
-- ============================================

delete from pagos;
delete from ventas;
delete from movimientos;
