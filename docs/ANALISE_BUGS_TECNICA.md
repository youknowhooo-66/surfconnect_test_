# 🛡️ Análise Técnica de Bugs e Gaps — SurfConnect

Este documento detalha as inconsistências, bugs e lacunas funcionais identificadas na base de código atual do SurfConnect. Ele serve como guia para a equipe de desenvolvimento para a implementação de correções e melhorias.

## 📊 Matriz de Prioridade

| Severidade | Descrição | Impacto no Negócio |
|:---|:---|:---|
| 🔴 **Alta** | Bloqueia fluxo principal ou gera perda de dados/integridade. | Crítico |
| 🟡 **Média** | Funcionalidade incompleta ou UX prejudicada, mas com workaround. | Moderado |
| 🟢 **Baixa** | Melhorias estéticas, de documentação ou polimento de UX. | Baixo |

---

## 🔍 Detalhamento dos Problemas

### 1. Fluxo de Status de Agendamento Incompleto
- **Local:** `backend/prisma/schema.prisma` e `backend/controllers/classController.js`
- **Severidade:** 🔴 Alta
- **Comportamento Esperado:** O agendamento deve seguir um ciclo de vida lógico: `PENDING` (Aguardando pagamento/confirmação) $ightarrow$ `CONFIRMED` (Vaga garantida) $ightarrow$ `COMPLETED` (Aula realizada) ou `CANCELED` (Vaga liberada).
- **Comportamento Atual:** O enum `BookingStatus` possui apenas `CONFIRMED` e `CANCELED`. O agendamento nasce como `CONFIRMED`, ignorando a fase de pendência e a de conclusão.
- **Sugestão Técnica:** 
  - Atualizar `enum BookingStatus` no Prisma para incluir `PENDING` e `COMPLETED`.
  - Alterar `createBooking` para iniciar como `PENDING`.

### 2. Ausência de Recurso de Cancelamento pelo Aluno
- **Local:** `backend/controllers/classController.js`
- **Severidade:** 🔴 Alta
- **Comportamento Esperado:** O aluno deve ter a autonomia de cancelar sua própria reserva em uma aula, liberando a vaga para outros estudantes.
- **Comportamento Atual:** Não existe endpoint no backend que permita a alteração do status de um `Booking` para `CANCELED` por parte do aluno.
- **Sugestão Técnica:** 
  - Implementar endpoint `PUT /api/bookings/:id/cancel`.
  - Validar se o `req.user.id` (do token JWT) coincide com o `studentId` do agendamento antes de permitir o cancelamento.

### 3. Inconsistência na Marcação de Presença
- **Local:** `backend/controllers/classController.js` $ightarrow$ `markAttendance`
- **Severidade:** 🟡 Média
- **Comportamento Esperado:** Ao registrar a presença do aluno, o sistema deve marcar o pagamento como `PAID` **e** o status do agendamento como `COMPLETED`, indicando que o serviço foi entregue.
- **Comportamento Atual:** A função altera apenas o `paymentStatus` para `PAID`, mas o agendamento permanece como `CONFIRMED`, dificultando relatórios de aulas realizadas vs. agendadas.
- **Sugestão Técnica:** 
  - Atualizar a chamada `prisma.booking.update` para setar `status: 'COMPLETED'` simultaneamente ao pagamento.

### 4. Limitação na Gestão Administrativa de Reservas
- **Local:** `backend/controllers/classController.js`
- **Severidade:** 🟡 Média
- **Comportamento Esperado:** O Administrador deve ter controle total sobre os agendamentos, podendo alterar o status de qualquer reserva (ex: confirmar manualmente um pagamento ou cancelar por motivo de força maior).
- **Comportamento Atual:** O Admin consegue visualizar a lista de agendamentos, mas não possui interface ou endpoint para editá-los.
- **Sugestão Técnica:** 
  - Implementar endpoint `PATCH /api/admin/bookings/:id/status` protegido por middleware de `ADMIN`.

### 5. Feedback de Erros Genérico na Autenticação
- **Local:** `frontend/src/pages/LoginRegister.jsx` e `backend/controllers/authController.js`
- **Severidade:** 🟢 Baixa
- **Comportamento Esperado:** O usuário deve receber mensagens claras e específicas (ex: "Este e-mail já está em uso", "Senha incorreta") com destaque visual (cores de erro).
- **Comportamento Atual:** O backend envia mensagens, mas o frontend tende a tratar erros de forma genérica ou sem feedback visual imediato e intuitivo.
- **Sugestão Técnica:** 
  - Implementar um sistema de Toast ou alertas dinâmicos no frontend que consumam a propriedade `message` retornada pelo backend.

### 6. Falta de Confirmação em Ações Críticas
- **Local:** `frontend/src/pages/AdminDashboard.jsx` e `StudentDashboard.jsx`
- **Severidade:** 🟢 Baixa
- **Comportamento Esperado:** Ações destrutivas (excluir aula, cancelar agendamento) devem exigir a confirmação do usuário via modal ou diálogo.
- **Comportamento Atual:** As ações são executadas imediatamente ao clique, aumentando o risco de erros operacionais acidentais.
- **Sugestão Técnica:** 
  - Criar um componente de `ConfirmationModal` reutilizável no frontend para envolver funções de deleção e cancelamento.

---

## 🛠️ Arquivos Afetados (Mapeamento)

- **Backend:**
  - `backend/prisma/schema.prisma`
  - `backend/controllers/classController.js`
  - `backend/routes/classRoutes.js` (Necessário criar novas rotas)
- **Frontend:**
  - `frontend/src/pages/AdminDashboard.jsx`
  - `frontend/src/pages/StudentDashboard.jsx`
  - `frontend/src/pages/LoginRegister.jsx`
