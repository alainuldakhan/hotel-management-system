import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Checkbox, Popover, Spin } from 'antd';

export function HomePage() {
    const navigate = useNavigate();
    const [destination, setDestination] = useState('');
    const [destinationOpen, setDestinationOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<{ city: string; country: string }[]>([]);

    const defaultDestinations = [
        { city: 'Алматы', country: 'Казахстан' },
        { city: 'Астана', country: 'Казахстан' },
        { city: 'Стамбул', country: 'Турция' },
        { city: 'Ташкент', country: 'Узбекистан' },
        { city: 'Дубай', country: 'ОАЭ' },
    ];

    useEffect(() => {
        if (!destination.trim()) {
            setSearchResults(defaultDestinations);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                // Fetching from OpenStreetMap Nominatim API (Free, allows CORS)
                const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&addressdetails=1&accept-language=ru&featuretype=city&limit=5`);
                const data = await response.json();

                const mappedResults = data.map((item: any) => {
                    const addr = item.address;
                    const city = addr.city || addr.town || addr.village || addr.state || item.name;
                    const country = addr.country || '';
                    return { city, country };
                }).filter((item: any, index: number, self: any[]) =>
                    index === self.findIndex((t) => (t.city === item.city && t.country === item.country))
                );

                setSearchResults(mappedResults.length > 0 ? mappedResults : defaultDestinations);
            } catch (error) {
                console.error("API error", error);
                setSearchResults(defaultDestinations);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [destination]);

    const destinationContent = (
        <div style={{ width: '360px', padding: '8px 0', border: 'none' }}>
            <div style={{ padding: '8px 16px', fontSize: '16px', fontWeight: 800, color: '#1a1a2e', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {destination.trim() ? 'Результаты поиска' : 'Популярные направления'}
                {loading && <Spin size="small" />}
            </div>
            {searchResults.map((dest, idx) => (
                <div
                    key={idx}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        borderBottom: idx === searchResults.length - 1 ? 'none' : '1px solid #f2f6fa'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f2f6fa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => {
                        setDestination(dest.city);
                        setDestinationOpen(false);
                    }}
                >
                    <div style={{ marginRight: '16px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24, color: '#1a1a2e' }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2 }}>{dest.city}</div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{dest.country}</div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: '"Nunito Sans", sans-serif' }}>
            {/* ── Header & Hero Section (Dark Blue) ─────────────────────────── */}
            <div style={{ background: '#003580', color: '#ffffff', paddingBottom: '60px' }}>
                {/* Top Navbar */}
                <div
                    style={{
                        maxWidth: 1100,
                        margin: '0 auto',
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    {/* Brand */}
                    <div
                        style={{ fontSize: '26px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                        onClick={() => navigate('/')}
                    >
                        Roomy
                    </div>

                    {/* Top Right Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '15px', fontWeight: 600 }}>
                        <span style={{ cursor: 'pointer' }}>KZT</span>
                        <span style={{ cursor: 'pointer', fontSize: '15px' }}>РУС</span>
                        <span style={{ cursor: 'pointer' }}>Служба поддержки</span>
                        <Button
                            style={{ color: '#0071c2', fontWeight: 600, border: 'none' }}
                            onClick={() => navigate('/login')}
                        >
                            Регистрация
                        </Button>
                        <Button
                            style={{ color: '#0071c2', fontWeight: 600, border: 'none' }}
                            onClick={() => navigate('/login')}
                        >
                            Войти
                        </Button>
                    </div>
                </div>

                {/* Secondary Navbar (Pills) */}
                <div
                    style={{
                        maxWidth: 1100,
                        margin: '0 auto',
                        padding: '0 20px 30px',
                        display: 'flex',
                        gap: '10px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            border: '1px solid #ffffff',
                            borderRadius: '30px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            cursor: 'pointer',
                            fontWeight: 600,
                        }}
                    >
                        Номера
                    </div>
                    {[
                        { label: 'Услуги и Спа' },
                        { label: 'Акции' },
                        { label: 'Отзывы' },
                    ].map((item) => (
                        <div
                            key={item.label}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                borderRadius: '30px',
                                cursor: 'pointer',
                                fontWeight: 600,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>

                {/* Hero Title */}
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 40px' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: 800, margin: '0 0 10px 0', lineHeight: 1.2 }}>
                        Забронируйте идеальный номер
                    </h1>
                    <p style={{ fontSize: '24px', margin: 0 }}>
                        Бронируйте напрямую в Roomy по лучшим ценам с гарантией комфорта...
                    </p>
                </div>
            </div>

            {/* ── Search Box & Content Area ───────────────────────────────── */}
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>

                {/* Search Box */}
                <div
                    style={{
                        background: '#FFB700',
                        padding: '4px',
                        borderRadius: '8px',
                        display: 'flex',
                        marginTop: '-32px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        gap: '4px',
                        height: '64px',
                    }}
                >
                    {/* Destination Search */}
                    <Popover
                        content={destinationContent}
                        trigger="click"
                        placement="bottomLeft"
                        open={destinationOpen}
                        onOpenChange={setDestinationOpen}
                        overlayInnerStyle={{ padding: 0, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                    >
                        <div style={{ flex: '1.5', background: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', padding: '0 12px', cursor: 'pointer' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24, marginRight: 10, color: '#1a1a2e' }}>
                                <path d="M4 4v16M20 12v8M4 12h16M4 8h11a3 3 0 0 1 3 3v1" />
                            </svg>
                            <input
                                placeholder="Куда вы хотите поехать?"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '16px', fontWeight: 600, color: '#1a1a2e', cursor: 'text' }}
                            />
                        </div>
                    </Popover>

                    {/* Dates */}
                    <div style={{ flex: '1.2', background: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                        <span style={{ fontSize: '15px', color: '#1a1a2e', fontWeight: 600 }}>Заезд — Выезд</span>
                    </div>

                    {/* Guests */}
                    <div style={{ flex: '1.2', background: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                        <span style={{ fontSize: '15px', color: '#1a1a2e', fontWeight: 600 }}>2 взрослых · 0 детей · 1 номер</span>
                    </div>

                    {/* Search Button */}
                    <Button
                        type="primary"
                        style={{
                            flex: '0.5',
                            height: '100%',
                            background: '#0071c2',
                            borderRadius: '4px',
                            fontSize: '20px',
                            fontWeight: 700,
                            padding: '0 24px',
                            border: 'none'
                        }}
                        onClick={() => navigate('/login')}
                    >
                        Найти
                    </Button>
                </div>

                {/* Add transfer checkbox */}
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#1a1a2e' }}>
                    <Checkbox /> Нужен трансфер от аэропорта
                </div>

                {/* ── Why Roomy Section ──────────────────────────────── */}
                <div style={{ marginTop: '48px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a2e', marginBottom: '16px' }}>
                        Почему выбирают Roomy?
                    </h2>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        {[
                            {
                                title: 'Бронируйте сейчас, платите при заезде',
                                desc: 'Бесплатная отмена для большинства номеров',
                            },
                            {
                                title: 'Сотни реальных отзывов от гостей',
                                desc: 'Читайте честные мнения наших постояльцев',
                            },
                            {
                                title: 'Безупречная чистота и комфорт',
                                desc: 'Каждодневная уборка и премиальное белье',
                            },
                            {
                                title: 'Круглосуточный премиальный сервис',
                                desc: 'Мы всегда здесь, чтобы помочь вам 24/7',
                            },
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                style={{
                                    flex: 1,
                                    background: '#f2f6fa',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    border: '1px solid #d4d9de',
                                }}
                            >
                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px', lineHeight: 1.3 }}>
                                    {feature.title}
                                </div>
                                <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.4 }}>
                                    {feature.desc}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Property Types Section ────────────────────────────── */}
                <div style={{ marginTop: '48px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a2e', marginBottom: '16px' }}>
                        Поиск по типу размещения
                    </h2>

                    <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', scrollbarWidth: 'none' }}>
                        {[
                            {
                                title: 'Отели',
                                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=400&fit=crop'
                            },
                            {
                                title: 'Семейные отели и дома для отдыха',
                                image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=500&h=400&fit=crop'
                            },
                            {
                                title: 'Квартиры',
                                image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=400&fit=crop'
                            },
                            {
                                title: 'Виллы',
                                image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500&h=400&fit=crop'
                            },
                        ].map((type, idx) => (
                            <div key={idx} style={{ flex: '0 0 calc(25% - 12px)', cursor: 'pointer' }}>
                                <div style={{
                                    width: '100%',
                                    aspectRatio: '4/3',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    marginBottom: '12px'
                                }}>
                                    <img
                                        src={type.image}
                                        alt={type.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e' }}>
                                    {type.title}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Offers Section ────────────────────────────────────────── */}
                <div style={{ marginTop: '48px', paddingBottom: '60px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px 0' }}>
                        Спецпредложения
                    </h2>
                    <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '20px' }}>
                        Акции, скидки и специальные тарифы для вас
                    </p>

                    <div
                        style={{
                            background: '#ffffff',
                            border: '1px solid #d4d9de',
                            borderRadius: '8px',
                            padding: '24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        }}
                    >
                        <div style={{ maxWidth: '60%' }}>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Горячее предложение</div>
                            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a2e', marginBottom: '8px' }}>
                                Скидка 15% на длительное проживание
                            </div>
                            <div style={{ fontSize: '15px', color: '#1a1a2e', marginBottom: '20px' }}>
                                Сэкономьте на вашем следующем визите. Забронируйте от 3 ночей и получите скидку 15%. Акция действует до 1 апреля 2026 года.
                            </div>
                            <Button type="primary" style={{ background: '#0071c2', fontWeight: 600, borderRadius: '4px', padding: '0 24px', height: '36px', border: 'none' }}>
                                Посмотреть номера
                            </Button>
                        </div>
                        <div style={{ width: '120px', height: '120px', borderRadius: '4px', overflow: 'hidden' }}>
                            <img
                                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=120&h=120&fit=crop"
                                alt="Offer"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
