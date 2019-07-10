# Lógica em Programação 2019.1 - Trabalho 2
## Verificação do modelo de Dolev-Yao em NuSMV

### **0A**: Comunicação Simples

- Arquivo: [link](./tete_a_tete.smv)

Neste exemplo, apenas há comunicação simples entre dois agentes (A e B). Ao receber uma mensagem, um agente imediatamente envia uma resposta.

### **0B**: Comunicação Simples com Criptografia

- Arquivo: [link](./tete_a_tete_enc.smv)

Este exemplo é similar ao **0A**, porém cada agente possui um par de chaves (pública e privada). Antes de enviar uma mensagem, um agente a encripta com a chave pública do destinatário. Um agente só pode decriptar uma mensagem se ela houver sido encriptada com sua chave pública.

Para que um agente leia uma mensagem, ele precisa decriptá-la primeiro. E um agente apenas envia uma resposta depois de ter lido a mensagem.

### **1**: Ataque Man-in-the-Middle

- Arquivo: [link](./tete_a_tete_mitm.smv)

Este exemplo é similar ao **0B**, porém há a presença de um intruso (agente Z). O intruso é capaz de obter mensagens que não estão destinadas a ele, embora siga as mesmas regras de criptografia que os agentes. O intruso também pode trocar os campos de remetente/destinatário de uma mensagem mesmo sem tê-la lido.

Neste exemplo, podemos utilizar o comando abaixo para verificar que o agente Z é capaz de obter a mensagem trocada entre A e B:

```
    check_ctlspec -p "EF (agent_Z.read_msg)"
```

Similarmente, o comando abaixo prova um resultado secundário, que nenhuma mensagem é enviada sem estar encriptada:

```
    check_ctlspec -p "EF (msg_with = nil & msg_encriptada = nil)"
```

### **2**: Ataque Man-in-the-Middle (Patcheado)

- Arquivo: [link](./tete_a_tete_mitm_patched.smv)

Este exemplo é similar ao **1**, porém o protocolo de troca de mensagens difere. Há agora dois remetentes: um *externo* e um *interno*. O remetente interno pertence à mensagem, de modo que para lê-lo é preciso decriptá-la; já o remetente externo funciona como no exemplo **1**. 

O remetente interno é utilizado para encriptar as mensagens, enquanto o remetente externo para definir o destinatário. Esta modificação no protocolo garante que o agente Z nunca é capaz de obter a mensagem trocada entre A e B, como verificado no comando abaixo:

```
    check_ctlspec -p "EF (agent_Z.read_msg)"
```





