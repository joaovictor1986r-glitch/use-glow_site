/* =====================================================================
   USE GLOW — script.js
   Todo o JavaScript do site, dividido por seção. Cada bloco funciona de
   forma independente, então dá pra remover alguma parte sem quebrar o
   resto (por exemplo: se um dia trocarem o carrinho de compras).
   ===================================================================== */

document.addEventListener('DOMContentLoaded', function () {

    /* -------------------------------------------------------------------
       1. HEADER TRANSPARENTE -> SÓLIDO AO ROLAR
       Adiciona a classe "scrolled" no header assim que a pessoa desce mais
       de 40px na página. O CSS (.site-header.scrolled) cuida da aparência.
    ------------------------------------------------------------------- */
    const siteHeader = document.getElementById('site-header');

    function atualizarHeader() {
        if (window.scrollY > 40) {
            siteHeader.classList.add('scrolled');
        } else {
            siteHeader.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', atualizarHeader);
    atualizarHeader();


    /* -------------------------------------------------------------------
       2. MENU HAMBÚRGUER (mobile)
    ------------------------------------------------------------------- */
    const botaoHamburguer = document.getElementById('btn-hamburguer');
    const menuPrincipal = document.getElementById('menu-principal');

    botaoHamburguer.addEventListener('click', function () {
        menuPrincipal.classList.toggle('aberto');
    });
    document.querySelectorAll('.menu-principal a').forEach(function (link) {
        link.addEventListener('click', function () {
            menuPrincipal.classList.remove('aberto');
        });
    });


    /* -------------------------------------------------------------------
       3. CARROSSEL DO HERO (Swiper)
       Protegido com try/catch: se o CDN do Swiper falhar por qualquer
       motivo (sem internet, bloqueio de rede etc.), o carrossel some mas
       o resto do site (filtros, modal, contadores...) continua funcionando
       normalmente em vez de travar tudo.
    ------------------------------------------------------------------- */
    try {
        const swiper = new Swiper('.hero-swiper', {
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    } catch (erro) {
        console.warn('Swiper não carregou (CDN indisponível?):', erro);
    }


    /* -------------------------------------------------------------------
       4. ANIMAÇÃO DE ENTRADA AO ROLAR (scroll reveal)
       Todo elemento com a classe "reveal" começa invisível/deslocado (ver
       CSS) e ganha a classe "is-visible" assim que entra na tela. Usa
       IntersectionObserver, que é leve e não fica calculando posição a
       cada scroll (mais performático que um listener de scroll manual).
    ------------------------------------------------------------------- */
    const elementosReveal = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const observerReveal = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada, indice) {
                if (entrada.isIntersecting) {
                    // pequeno atraso crescente pra elementos do mesmo grupo
                    // aparecerem em sequência, não todos de uma vez
                    const atraso = (indice % 4) * 80;
                    setTimeout(function () {
                        entrada.target.classList.add('is-visible');
                    }, atraso);
                    observerReveal.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.15 });

        elementosReveal.forEach(function (el) { observerReveal.observe(el); });
    } else {
        // navegador muito antigo sem suporte: mostra tudo direto
        elementosReveal.forEach(function (el) { el.classList.add('is-visible'); });
    }


    /* -------------------------------------------------------------------
       5. CURSOR PERSONALIZADO NAS FOTOS DO CATÁLOGO (só desktop)
       Cria um pequeno círculo com "Ver" que segue o mouse quando passa por
       cima de uma foto de produto. Em telas de toque (celular/tablet) isso
       fica desligado, porque não existe "hover" de mouse nesses aparelhos.
    ------------------------------------------------------------------- */
    const ehTelaDeToque = window.matchMedia('(pointer: coarse)').matches;

    if (!ehTelaDeToque) {
        const cursorPersonalizado = document.createElement('div');
        cursorPersonalizado.className = 'cursor-produto';
        cursorPersonalizado.textContent = 'Ver';
        document.body.appendChild(cursorPersonalizado);

        document.addEventListener('mousemove', function (e) {
            cursorPersonalizado.style.left = e.clientX + 'px';
            cursorPersonalizado.style.top = e.clientY + 'px';
        });

        document.querySelectorAll('.product-image').forEach(function (imagem) {
            imagem.addEventListener('mouseenter', function () {
                cursorPersonalizado.classList.add('ativo');
            });
            imagem.addEventListener('mouseleave', function () {
                cursorPersonalizado.classList.remove('ativo');
            });
        });
    }


    /* -------------------------------------------------------------------
       6. EFEITO "SKELETON" NAS FOTOS (carregamento suave)
       Enquanto a foto de produto não carrega, mostra um fundo em degradê
       animado (definido no CSS). Assim que a imagem termina de carregar,
       adiciona a classe "carregada" na foto, que faz um fade-in suave e
       esconde o skeleton.
    ------------------------------------------------------------------- */
    document.querySelectorAll('.product-image img').forEach(function (img) {
        function marcarCarregada() { img.classList.add('carregada'); }
        if (img.complete) {
            marcarCarregada();
        } else {
            img.addEventListener('load', marcarCarregada);
            img.addEventListener('error', marcarCarregada);
        }
    });


    /* -------------------------------------------------------------------
       7. CONTADORES ANIMADOS (seção "Números")
       Cada .numero-valor tem um atributo data-alvo com o número final.
       Quando a seção entra na tela, o número sobe de 0 até o alvo.
    ------------------------------------------------------------------- */
    const numerosValores = document.querySelectorAll('.numero-valor');

    function animarContador(elemento) {
        const alvo = parseInt(elemento.getAttribute('data-alvo'), 10) || 0;
        const duracaoMs = 1400;
        const inicio = performance.now();

        function passo(agora) {
            const progresso = Math.min((agora - inicio) / duracaoMs, 1);
            // easing suave (desacelera no final) em vez de contagem linear
            const progressoSuave = 1 - Math.pow(1 - progresso, 3);
            elemento.textContent = Math.floor(progressoSuave * alvo);
            if (progresso < 1) {
                requestAnimationFrame(passo);
            } else {
                elemento.textContent = alvo;
            }
        }
        requestAnimationFrame(passo);
    }

    if (numerosValores.length && 'IntersectionObserver' in window) {
        const observerNumeros = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    animarContador(entrada.target);
                    observerNumeros.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.5 });

        numerosValores.forEach(function (el) { observerNumeros.observe(el); });
    }


    /* -------------------------------------------------------------------
       8. FILTRO DO CATÁLOGO (abas "Vestidos", "Blusas & Tops"...)
       Cada botão de aba tem data-filtro. Cada card de produto tem
       data-categoria. Ao clicar numa aba, mostra só os cards com a
       categoria correspondente (ou todos, se for "todos").
       Quando um filtro específico está ativo, a paginação "Ver mais" some
       e todos os itens daquela categoria aparecem de uma vez — só faz
       sentido paginar a lista completa "Todos".
    ------------------------------------------------------------------- */
    const botoesFiltro = document.querySelectorAll('.tab-btn');
    const cardsProduto = document.querySelectorAll('.product-card');
    const botaoVerMais = document.getElementById('btn-ver-mais');
    let filtroAtual = 'todos';

    function aplicarFiltro(filtro) {
        filtroAtual = filtro;

        cardsProduto.forEach(function (card) {
            const pertenceAoFiltro = (filtro === 'todos' || card.getAttribute('data-categoria') === filtro);

            if (filtro === 'todos') {
                // no modo "Todos" quem manda é a paginação: só reaparecem os
                // cards que a paginação já tinha revelado.
                const estaOcultoPelaPaginacao = card.classList.contains('oculto-paginacao');
                card.style.display = estaOcultoPelaPaginacao ? 'none' : '';
            } else {
                card.style.display = pertenceAoFiltro ? '' : 'none';
            }
        });

        // esconde "Ver mais" quando um filtro de categoria está ativo
        if (botaoVerMais) {
            const aindaTemOculto = document.querySelectorAll('.product-card.oculto-paginacao').length > 0;
            botaoVerMais.style.display = (filtro === 'todos' && aindaTemOculto) ? '' : 'none';
        }
    }

    botoesFiltro.forEach(function (botao) {
        botao.addEventListener('click', function () {
            botoesFiltro.forEach(function (b) { b.classList.remove('active'); });
            botao.classList.add('active');
            aplicarFiltro(botao.getAttribute('data-filtro'));
        });
    });


    /* -------------------------------------------------------------------
       9. "VER MAIS PEÇAS" (paginação simples do catálogo)
       Revela, a cada clique, o próximo lote de cards escondidos
       (class "oculto-paginacao"). Quando acabam os cards escondidos,
       o botão desaparece sozinho.
    ------------------------------------------------------------------- */
    const TAMANHO_DO_LOTE = 8;

    if (botaoVerMais) {
        botaoVerMais.addEventListener('click', function () {
            const ocultos = document.querySelectorAll('.product-card.oculto-paginacao');
            const proximoLote = Array.prototype.slice.call(ocultos, 0, TAMANHO_DO_LOTE);

            proximoLote.forEach(function (card) {
                card.classList.remove('oculto-paginacao');
                card.classList.add('reveal'); // reaproveita a animação de entrada
                // força a foto a checar o "skeleton" já que acabou de aparecer
                const imgDoCard = card.querySelector('.product-image img');
                if (imgDoCard && imgDoCard.complete) imgDoCard.classList.add('carregada');
            });

            // re-observa os novos cards pra eles também ganharem o fade-in
            if ('IntersectionObserver' in window) {
                proximoLote.forEach(function (card) {
                    card.classList.remove('is-visible');
                    requestAnimationFrame(function () { card.classList.add('is-visible'); });
                });
            }

            if (document.querySelectorAll('.product-card.oculto-paginacao').length === 0) {
                botaoVerMais.style.display = 'none';
            }
        });
    }


    /* -------------------------------------------------------------------
       10. MODAL DE PRODUTO ("Ver Detalhes")
       Ao clicar no botão de um card, abre um modal central com foto maior,
       nome da peça e um botão que já leva pro WhatsApp com a mensagem
       daquela peça específica.
    ------------------------------------------------------------------- */
    const modalProduto = document.getElementById('produto-modal');
    const modalImg = document.getElementById('modal-produto-img');
    const modalNome = document.getElementById('modal-produto-nome');
    const modalWhats = document.getElementById('modal-produto-whats');

    function abrirModalProduto(botao) {
        modalImg.src = botao.getAttribute('data-img');
        modalImg.alt = botao.getAttribute('data-nome');
        modalNome.textContent = botao.getAttribute('data-nome');
        modalWhats.href = botao.getAttribute('data-whats');

        modalProduto.classList.add('aberto');
        modalProduto.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // trava o scroll de fundo
    }

    function fecharModalProduto() {
        modalProduto.classList.remove('aberto');
        modalProduto.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.quick-view-btn').forEach(function (botao) {
        botao.addEventListener('click', function () { abrirModalProduto(botao); });
    });

    document.querySelectorAll('[data-fechar-modal]').forEach(function (el) {
        el.addEventListener('click', fecharModalProduto);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') fecharModalProduto();
    });


    /* -------------------------------------------------------------------
       11. CAPTAÇÃO DE LEAD VIA WHATSAPP (seção "Receba novidades")
       Como o site é só front-end (sem servidor próprio), não dá pra
       guardar e-mails de verdade num banco de dados. Em vez disso, o
       formulário monta uma mensagem de WhatsApp já com o nome da pessoa
       e abre a conversa com a loja — funciona sem precisar de nenhum
       serviço externo. Se no futuro quiserem e-mail de verdade (tipo
       Mailchimp), esse trecho precisa ser trocado por uma integração
       daquele serviço.
    ------------------------------------------------------------------- */
    const formNewsletter = document.getElementById('form-newsletter');

    if (formNewsletter) {
        formNewsletter.addEventListener('submit', function (e) {
            e.preventDefault();
            const nome = document.getElementById('newsletter-nome').value.trim();
            if (!nome) return;

            const mensagem = 'Olá! Meu nome é ' + nome + ' e quero receber as novidades da Use Glow. ✨';
            const link = 'https://wa.me/5511957109272?text=' + encodeURIComponent(mensagem);
            window.open(link, '_blank');
            formNewsletter.reset();
        });
    }

});
