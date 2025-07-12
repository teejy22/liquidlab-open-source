import { useEffect, useRef } from 'react';

export default function TradingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Trading data visualization
    const drawTradingData = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let x = 0; x < canvas.width; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y < canvas.height; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw floating trading symbols
      ctx.font = '14px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      
      const symbols = ['ETH', 'BTC', 'SOL', 'USDC', 'AVAX', 'DOT'];
      const time = Date.now() * 0.001;
      
      symbols.forEach((symbol, index) => {
        const x = (Math.sin(time + index * 2) * 200) + (canvas.width / 2);
        const y = (Math.cos(time + index * 1.5) * 100) + (canvas.height / 2);
        ctx.fillText(symbol, x, y);
      });

      // Draw price lines
      ctx.strokeStyle = 'rgba(0, 208, 132, 0.1)';
      ctx.lineWidth = 2;
      
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const y = (Math.sin(time + i) * 50) + (canvas.height / 2) + (i * 40);
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    // Animation loop
    const animate = () => {
      drawTradingData();
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.3 }}
    />
  );
}