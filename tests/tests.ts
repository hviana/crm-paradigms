import {
  Action,
  assertEquals,
  Condition,
  delay,
  Instigation,
  NotifyingHolon,
  Premise,
  Rule,
} from "../deps.ts";
import { ClientFBE, SegmentFBE } from "../fbes.ts";

var testClientes: string[] = [];
const clientX = new ClientFBE();
const segmentY = new SegmentFBE({
  onNotification: (n: any) => testClientes = n.value.clientes,
});
const premise1 = new NotifyingHolon({
  f: Premise.leftIsNot(undefined),
});
const premise2 = new NotifyingHolon({
  f: Premise.leftIs("Camisa azul"),
});
const condition = new NotifyingHolon({
  f: Condition.and,
});
const rule = new NotifyingHolon({
  f: Rule.default,
});
const action = new NotifyingHolon({
  f: Action.default,
});
const instigation = new NotifyingHolon({
  f: Instigation.default,
});

//@ts-ignore
clientX.ultimaCompra.connect({ left: premise1 });
//@ts-ignore
clientX.ultimaPaginaAcessada.connect({ left: premise2 });
premise1.connect({ 1: condition });
premise2.connect({ 2: condition });
condition.connect({ default: rule });
rule.connect({ default: action });
action.connect({ default: instigation });
//@ts-ignore
instigation.connect({ default: segmentY.adicionarClienteX });

Deno.test("teste - aplicação em PON", async () => {
  //@ts-ignore
  clientX.ultimaCompra.receive({ act: Date.now() });
  await delay(100);
  assertEquals(testClientes.length, 0);
  //@ts-ignore
  clientX.acessarCamisaAzul.receive({ act: Date.now() });
  await delay(100);
  //@ts-ignore
  assertEquals(testClientes.length, 1);
});
