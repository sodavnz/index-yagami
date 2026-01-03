
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useBranch } from '../../contexts/BranchContext';

export default function SpecialEffects() {
  const [effectType, setEffectType] = useState<string>('none');
  const [effectIntensity, setEffectIntensity] = useState<number>(30);
  const { currentBranch } = useBranch();

  useEffect(() => {
    if (currentBranch?.id) {
      loadEffectSettings();

      // Subscribe to changes
      const channel = supabase
        .channel('branches_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'branches',
            filter: `id=eq.${currentBranch.id}`,
          },
          (payload) => {
            if (payload.new) {
              const newData = payload.new as { effect_type?: string; effect_intensity?: number };
              if ('effect_type' in newData) {
                setEffectType(newData.effect_type || 'none');
              }
              if ('effect_intensity' in newData) {
                setEffectIntensity(newData.effect_intensity || 30);
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentBranch?.id]);

  const loadEffectSettings = async () => {
    if (!currentBranch?.id) return;

    try {
      const { data } = await supabase
        .from('branches')
        .select('effect_type, effect_intensity')
        .eq('id', currentBranch.id)
        .single();

      if (data) {
        setEffectType(data.effect_type || 'none');
        setEffectIntensity(data.effect_intensity || 30);
      }
    } catch (error) {
      console.error('Error loading effect settings:', error);
    }
  };

  useEffect(() => {
    if (effectType === 'none') return;

    const container = document.createElement('div');
    container.id = 'special-effects-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      overflow: hidden;
    `;
    document.body.appendChild(container);

    const baseCount = effectType === 'fireworks' ? 2 : effectType === 'confetti' ? 30 : 20;
    const particleCount = Math.floor((baseCount * effectIntensity) / 50);
    const createInterval = effectType === 'fireworks' ? 3000 : Math.max(500, 2000 - (effectIntensity * 10));

    const createParticle = () => {
      if (effectType === 'fireworks') {
        createFirework();
      } else if (effectType === 'snow' || effectType === 'hearts') {
        createFallingParticle();
      }
    };

    const createFirework = () => {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * (window.innerHeight * 0.5);
      const colors = ['#FF1744', '#F50057', '#D500F9', '#651FFF', '#2979FF', '#00E5FF', '#1DE9B6', '#76FF03', '#FFEA00', '#FF9100'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Giảm số lượng hạt từ 20-30 xuống 12-16
      const particleCount = 12 + Math.floor(Math.random() * 5);
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 1.5 + Math.random() * 1; // Giảm tốc độ
        const size = 2 + Math.random() * 2; // Giảm kích thước
        
        particle.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border-radius: 50%;
          box-shadow: 0 0 ${size}px ${color};
        `;
        
        container.appendChild(particle);
        
        let posX = x;
        let posY = y;
        let velX = Math.cos(angle) * velocity;
        let velY = Math.sin(angle) * velocity;
        let opacity = 1;
        let frame = 0;
        
        const animate = () => {
          frame++;
          
          // Chỉ update mỗi 2 frame để giảm tải
          if (frame % 2 === 0) {
            velY += 0.04; // Giảm trọng lực
            posX += velX;
            posY += velY;
            opacity -= 0.02; // Giảm tốc độ mờ dần
            
            particle.style.transform = `translate(${posX - x}px, ${posY - y}px)`;
            particle.style.opacity = opacity.toString();
          }
          
          if (opacity > 0 && posY < window.innerHeight) {
            requestAnimationFrame(animate);
          } else {
            particle.remove();
          }
        };
        
        requestAnimationFrame(animate);
      }
    };

    const createFallingParticle = () => {
      const particle = document.createElement('div');
      const size = 6 + Math.random() * 10;
      const startX = Math.random() * window.innerWidth;
      const swing = Math.random() * 80 - 40;
      const rotation = Math.random() * 360;
      const initialOpacity = 0.7 + Math.random() * 0.3;

      let particleContent = '';
      let particleStyle = '';

      switch (effectType) {
        case 'snow':
          particleContent = '❄️';
          particleStyle = `
            font-size: ${size * 1.5}px;
            filter: brightness(${1 + Math.random() * 0.5});
          `;
          break;

        case 'hearts':
          particleContent = '❤️';
          particleStyle = `
            font-size: ${size * 1.5}px;
            filter: hue-rotate(${Math.random() * 60}deg);
          `;
          break;
      }

      particle.style.cssText = `
        position: absolute;
        top: -50px;
        left: ${startX}px;
        ${particleStyle}
        opacity: ${initialOpacity};
        transform-origin: center;
        will-change: transform;
      `;
      particle.textContent = particleContent;

      container.appendChild(particle);

      const duration = 7000 + Math.random() * 3000;
      const startTime = Date.now();
      const rotationSpeed = (Math.random() - 0.5) * 1.5;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
          const currentY = -50 + (window.innerHeight + 100) * progress;
          const currentX = startX + Math.sin(progress * Math.PI * 3) * swing;
          const currentRotation = rotation + (rotationSpeed * elapsed / 10);
          
          let currentOpacity = initialOpacity;
          if (progress < 0.1) {
            currentOpacity = initialOpacity * (progress * 10);
          } else if (progress > 0.9) {
            currentOpacity = initialOpacity * ((1 - progress) * 10);
          }

          particle.style.transform = `translate(${currentX - startX}px, ${currentY + 50}px) rotate(${currentRotation}deg)`;
          particle.style.opacity = currentOpacity.toString();

          requestAnimationFrame(animate);
        } else {
          particle.remove();
        }
      };

      requestAnimationFrame(animate);
    };

    // Initial burst - giảm số lượng ban đầu
    const initialCount = effectType === 'fireworks' ? 1 : Math.min(particleCount, 5);
    for (let i = 0; i < initialCount; i++) {
      setTimeout(() => createParticle(), i * (createInterval / initialCount));
    }

    // Continuous creation
    const interval = setInterval(() => {
      createParticle();
    }, createInterval);

    return () => {
      clearInterval(interval);
      container.remove();
    };
  }, [effectType, effectIntensity]);

  return null;
}
