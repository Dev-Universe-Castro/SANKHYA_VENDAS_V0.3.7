"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Mail, Phone, MessageSquare, FileText, Users, Calendar as CalendarIcon, DollarSign, User, Clock, Plus, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { Lead } from "@/lib/leads-service"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import { atualizarStatusLead } from "@/lib/lead-atividades-service"

interface LeadModalProps {
  isOpen: boolean
  onClose: () => void
  lead: Lead | null
  onSave: () => void
  funilSelecionado?: any
}

interface Partner {
  CODPARC: string
  NOMEPARC: string
  CGC_CPF: string
}

const TIPOS_TAG = [
  'Ads Production',
  'Landing Page',
  'Dashboard',
  'UX Design',
  'Video Production',
  'Typeface',
  'Web Design'
]

interface AtividadeItemProps {
  atividade: any
  codLead: string
  onReload: () => void
}

function AtividadeItem({ atividade, codLead, onReload }: AtividadeItemProps) {
  const { toast } = useToast()
  const [editandoAtividade, setEditandoAtividade] = useState(false)
  const [tituloAtividade, setTituloAtividade] = useState(atividade.DESCRICAO?.split('|')[0] || atividade.DESCRICAO || '')
  const [descricaoAtividade, setDescricaoAtividade] = useState(atividade.DESCRICAO?.split('|')[1] || '')
  const [tipoAtividade, setTipoAtividade] = useState(atividade.TIPO)
  const [corAtividade, setCorAtividade] = useState(atividade.COR || '#22C55E')
  const [dataInicioAtividade, setDataInicioAtividade] = useState(atividade.DATA_INICIO ? atividade.DATA_INICIO.slice(0, 16) : new Date().toISOString().slice(0, 16))
  const [dataFimAtividade, setDataFimAtividade] = useState(atividade.DATA_FIM ? atividade.DATA_FIM.slice(0, 16) : new Date().toISOString().slice(0, 16))
  const [salvandoAtividade, setSalvandoAtividade] = useState(false)
  const [concluindoAtividade, setConcluindoAtividade] = useState(false)
  const [inativandoAtividade, setInativandoAtividade] = useState(false)
  const estaRealizado = atividade.STATUS === 'REALIZADO'

  const marcarRealizadoAtividade = async () => {
    try {
      setConcluindoAtividade(true)
      const response = await fetch('/api/leads/atividades/atualizar-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CODATIVIDADE: atividade.CODATIVIDADE, STATUS: 'REALIZADO' })
      })

      if (!response.ok) throw new Error('Erro ao marcar como concluído')

      toast({
        title: "Sucesso",
        description: "Tarefa concluída",
      })

      await onReload()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setConcluindoAtividade(false)
    }
  }

  const marcarAguardandoAtividade = async () => {
    try {
      setConcluindoAtividade(true)
      const response = await fetch('/api/leads/atividades/atualizar-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CODATIVIDADE: atividade.CODATIVIDADE, STATUS: 'AGUARDANDO' })
      })

      if (!response.ok) throw new Error('Erro ao alterar status')

      toast({
        title: "Sucesso",
        description: "Status alterado para Aguardando",
      })

      await onReload()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setConcluindoAtividade(false)
    }
  }

  const salvarEdicaoAtividade = async () => {
    try {
      setSalvandoAtividade(true)

      // Adicionar ':00Z' para forçar UTC e evitar conversão de timezone
      const dataInicioUTC = dataInicioAtividade + ':00Z'
      const dataFimUTC = dataFimAtividade + ':00Z'

      const response = await fetch('/api/leads/atividades/atualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          CODATIVIDADE: atividade.CODATIVIDADE,
          TITULO: tituloAtividade,
          DESCRICAO: descricaoAtividade,
          TIPO: tipoAtividade,
          COR: corAtividade,
          DATA_INICIO: dataInicioUTC,
          DATA_FIM: dataFimUTC
        })
      })

      if (!response.ok) throw new Error('Erro ao atualizar')

      setEditandoAtividade(false)
      await onReload()

      toast({
        title: "Sucesso",
        description: "Atividade atualizada",
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSalvandoAtividade(false)
    }
  }

  const inativarAtividade = async () => {
    try {
      setInativandoAtividade(true)
      const response = await fetch('/api/leads/atividades/atualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          CODATIVIDADE: atividade.CODATIVIDADE,
          ATIVO: 'N'
        })
      })

      if (!response.ok) throw new Error('Erro ao inativar')

      toast({
        title: "Sucesso",
        description: "Atividade inativada",
      })

      await onReload()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setInativandoAtividade(false)
    }
  }

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-white">
      <div className="flex items-start justify-between">
        <div className="flex-1 flex items-start gap-2">
          {atividade.STATUS === 'REALIZADO' && <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />}
          {atividade.STATUS === 'ATRASADO' && <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />}
          {atividade.STATUS === 'AGUARDANDO' && <Clock className="w-5 h-5 text-blue-600 mt-0.5" />}
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{atividade.DESCRICAO?.split('|')[0] || atividade.DESCRICAO}</h3>
            <p className="text-xs text-muted-foreground mt-1">{atividade.DESCRICAO?.split('|')[1] || ''}</p>
          </div>
        </div>
        <Badge className={`${atividade.STATUS === 'REALIZADO' ? 'bg-green-500' : atividade.STATUS === 'ATRASADO' ? 'bg-red-500' : 'bg-blue-500'} text-white ml-2 flex-shrink-0`}>
          {atividade.STATUS === 'REALIZADO' ? 'Concluído' : atividade.STATUS === 'ATRASADO' ? 'Atrasado' : 'Aguardando'}
        </Badge>
      </div>

      {editandoAtividade ? (
        <div className="space-y-3 pt-3 border-t">
          <div>
            <Label className="text-xs">Título</Label>
            <Input
              value={tituloAtividade}
              onChange={(e) => setTituloAtividade(e.target.value)}
              className="text-xs"
              disabled={salvandoAtividade}
            />
          </div>
          <div>
            <Label className="text-xs">Descrição</Label>
            <Textarea
              value={descricaoAtividade}
              onChange={(e) => setDescricaoAtividade(e.target.value)}
              className="text-xs"
              disabled={salvandoAtividade}
              rows={2}
            />
          </div>
          <div>
            <Label className="text-xs">Tipo</Label>
            <Select value={tipoAtividade} onValueChange={setTipoAtividade} disabled={salvandoAtividade}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TAREFA">Tarefa</SelectItem>
                <SelectItem value="REUNIAO">Reunião</SelectItem>
                <SelectItem value="LIGACAO">Ligação</SelectItem>
                <SelectItem value="EMAIL">E-mail</SelectItem>
                <SelectItem value="VISITA">Visita</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Cor</Label>
            <Input
              type="color"
              value={corAtividade}
              onChange={(e) => setCorAtividade(e.target.value)}
              className="text-xs h-10"
              disabled={salvandoAtividade}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Data Início</Label>
              <Input
                type="datetime-local"
                value={dataInicioAtividade}
                onChange={(e) => setDataInicioAtividade(e.target.value)}
                className="text-xs"
                disabled={salvandoAtividade}
              />
            </div>
            <div>
              <Label className="text-xs">Data Fim</Label>
              <Input
                type="datetime-local"
                value={dataFimAtividade}
                onChange={(e) => setDataFimAtividade(e.target.value)}
                className="text-xs"
                disabled={salvandoAtividade}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={salvarEdicaoAtividade} disabled={salvandoAtividade}>
              {salvandoAtividade ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditandoAtividade(false)} disabled={salvandoAtividade}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="font-medium">Tipo:</span> {atividade.TIPO}
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium">Data:</span>{' '}
              {atividade.DATA_INICIO ? new Date(atividade.DATA_INICIO).toLocaleDateString('pt-BR') : new Date(atividade.DATA_HORA).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {estaRealizado ? (
              <Button
                size="sm"
                onClick={marcarAguardandoAtividade}
                className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
                disabled={concluindoAtividade}
              >
                {concluindoAtividade ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Alterando...
                  </>
                ) : (
                  'Voltar p/ Aguardando'
                )}
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={marcarRealizadoAtividade}
                  className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                  disabled={concluindoAtividade}
                >
                  {concluindoAtividade ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Concluindo...
                    </>
                  ) : (
                    'Concluir'
                  )}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditandoAtividade(true)} disabled={concluindoAtividade}>
                  Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={inativarAtividade} disabled={concluindoAtividade || inativandoAtividade}>
                  {inativandoAtividade ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Inativando...
                    </>
                  ) : (
                    'Inativar'
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function LeadModal({ isOpen, onClose, lead, onSave, funilSelecionado }: LeadModalProps) {
  const [formData, setFormData] = useState<Partial<Lead>>({
    NOME: "",
    DESCRICAO: "",
    VALOR: 0,
    CODESTAGIO: "",
    DATA_VENCIMENTO: new Date().toISOString().split('T')[0],
    TIPO_TAG: "",
    COR_TAG: "#3b82f6",
    CODPARC: undefined,
    CODFUNIL: undefined
  })
  const [isSaving, setIsSaving] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [parceiros, setParceiros] = useState<Partner[]>([])
  const [isLoadingPartners, setIsLoadingPartners] = useState(false)
  const [estagios, setEstagios] = useState<any[]>([])
  const { toast } = useToast()
  const [partnerSearch, setPartnerSearch] = useState("")
  const [partnerLoadError, setPartnerLoadError] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [atividades, setAtividades] = useState<any[]>([])
  const [eventos, setEventos] = useState<any[]>([])
  const [activeAtividadeTab, setActiveAtividadeTab] = useState<'nota' | 'email' | 'ligacao' | 'whatsapp' | 'proposta' | 'reuniao' | 'visita'>('nota')
  const [atividadeForm, setAtividadeForm] = useState({
    descricao: '',
    dataInicial: new Date().toISOString().slice(0, 16), // formato: YYYY-MM-DDTHH:mm
    dataFinal: new Date().toISOString().slice(0, 16) // formato: YYYY-MM-DDTHH:mm
  })
  const [produtosLead, setProdutosLead] = useState<any[]>([])
  const [isSavingAtividade, setIsSavingAtividade] = useState(false)
  const [isLoadingAtividades, setIsLoadingAtividades] = useState(false)
  const [isLoadingProdutos, setIsLoadingProdutos] = useState(false)
  const [editandoProduto, setEditandoProduto] = useState<string | null>(null)
  const [produtoEditForm, setProdutoEditForm] = useState({ quantidade: 0, vlrunit: 0 })
  const [showModalEdicaoProduto, setShowModalEdicaoProduto] = useState(false)
  const [produtoSelecionadoEdicao, setProdutoSelecionadoEdicao] = useState<any | null>(null)
  const [showAlterarEstagioModal, setShowAlterarEstagioModal] = useState(false)
  const [showAdicionarProdutoModal, setShowAdicionarProdutoModal] = useState(false)
  const [produtos, setProdutos] = useState<any[]>([])
  const [isLoadingProdutosDisponiveis, setIsLoadingProdutosDisponiveis] = useState(false)
  const [produtoSearch, setProdutoSearch] = useState("")
  const [produtoSelecionado, setProdutoSelecionado] = useState<any | null>(null)
  const [quantidadeProduto, setQuantidadeProduto] = useState(1)
  const [valorUnitarioProduto, setValorUnitarioProduto] = useState(0)
  const [showEditarTituloModal, setShowEditarTituloModal] = useState(false)
  const [novoTitulo, setNovoTitulo] = useState("")
  const [showPerdidoModal, setShowPerdidoModal] = useState(false)
  const [motivoPerda, setMotivoPerda] = useState("")
  const [showPedidoVendaModal, setShowPedidoVendaModal] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsInitializing(true)

      if (lead) {
        setFormData({
          NOME: lead.NOME || "",
          DESCRICAO: lead.DESCRICAO || "",
          VALOR: lead.VALOR || 0,
          CODESTAGIO: lead.CODESTAGIO || "",
          DATA_VENCIMENTO: lead.DATA_VENCIMENTO || "",
          TIPO_TAG: lead.TIPO_TAG || "",
          COR_TAG: lead.COR_TAG || "#3b82f6",
          CODPARC: lead.CODPARC || undefined,
          CODFUNIL: lead.CODFUNIL || undefined,
        })

        loadAtividades(lead.CODLEAD)
        loadEventos(lead.CODLEAD)
        loadProdutosLead(lead.CODLEAD)
      } else {
        setFormData({
          NOME: "",
          DESCRICAO: "",
          VALOR: 0,
          CODESTAGIO: "",
          DATA_VENCIMENTO: new Date().toISOString().split('T')[0],
          TIPO_TAG: "",
          COR_TAG: "#3b82f6",
          CODPARC: undefined,
          CODFUNIL: undefined,
        })
        setAtividades([])
        setEventos([])
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsInitializing(false)
        })
      })
    }
  }, [lead, isOpen])

  useEffect(() => {
    if (!isOpen) {
      setIsInitializing(false)
      setPartnerSearch("")
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      loadPartners()
      if (funilSelecionado) {
        setEstagios(funilSelecionado.estagios)
        if (!lead && funilSelecionado.estagios.length > 0) {
          setFormData(prev => ({
            ...prev,
            CODFUNIL: funilSelecionado.CODFUNIL,
            CODESTAGIO: funilSelecionado.estagios[0].CODESTAGIO
          }))
        } else if (lead && lead.CODFUNIL === funilSelecionado.CODFUNIL) {
          setFormData(prev => ({
            ...prev,
            CODFUNIL: funilSelecionado.CODFUNIL,
            CODESTAGIO: lead.CODESTAGIO || (funilSelecionado.estagios.length > 0 ? funilSelecionado.estagios[0].CODESTAGIO : "")
          }))
        }
      }
    }
  }, [isOpen, funilSelecionado, lead])

  const loadPartners = async (searchTerm: string = "") => {
    try {
      setIsLoadingPartners(true)
      setPartnerLoadError(false)
      const url = `/api/sankhya/parceiros?page=1&pageSize=50&searchName=${encodeURIComponent(searchTerm)}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Falha ao carregar parceiros')
      const data = await response.json()
      setParceiros(data.parceiros || [])
    } catch (error: any) {
      setPartnerLoadError(true)
      setParceiros([])
    } finally {
      setIsLoadingPartners(false)
    }
  }

  const handlePartnerSearch = (value: string) => {
    setPartnerSearch(value)
    if (value.length >= 2) {
      loadPartners(value)
    } else if (value.length === 0) {
      loadPartners()
    }
  }

  const loadAtividades = async (codLead: string) => {
    try {
      setIsLoadingAtividades(true)
      const response = await fetch(`/api/leads/atividades?codLead=${codLead}`)
      if (!response.ok) throw new Error('Erro ao carregar atividades')
      const data = await response.json()
      setAtividades(data)
    } catch (error) {
      console.error('Erro ao carregar atividades:', error)
    } finally {
      setIsLoadingAtividades(false)
    }
  }

  const loadEventos = async (codLead: string) => {
    try {
      const response = await fetch(`/api/leads/eventos?codLead=${codLead}`)
      if (!response.ok) throw new Error('Erro ao carregar eventos')
      const data = await response.json()
      setEventos(data)
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
    }
  }

  const loadProdutosLead = async (codLead: string) => {
    try {
      setIsLoadingProdutos(true)
      const response = await fetch(`/api/leads/produtos?codLead=${codLead}`)
      if (!response.ok) throw new Error('Erro ao carregar produtos')
      const data = await response.json()
      setProdutosLead(data)
    } catch (error) {
      console.error('Erro ao carregar produtos do lead:', error)
      setProdutosLead([])
    } finally {
      setIsLoadingProdutos(false)
    }
  }

  const handleRemoverProduto = async (codItem: string) => {
    if (!confirm('Deseja realmente remover este produto?')) return

    try {
      const response = await fetch('/api/leads/produtos/remover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codItem })
      })

      if (!response.ok) throw new Error('Erro ao remover produto')

      toast({
        title: "Sucesso",
        description: "Produto removido com sucesso",
      })

      // Recarregar produtos
      if (lead) {
        loadProdutosLead(lead.CODLEAD)
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const loadProdutosDisponiveis = async (searchTerm: string = "") => {
    try {
      setIsLoadingProdutosDisponiveis(true)
      const url = `/api/sankhya/produtos?page=1&pageSize=50&searchName=${encodeURIComponent(searchTerm)}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Falha ao carregar produtos')
      const data = await response.json()
      setProdutos(data.produtos || [])
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      setProdutos([])
    } finally {
      setIsLoadingProdutosDisponiveis(false)
    }
  }

  const handleProdutoSearch = (value: string) => {
    setProdutoSearch(value)
    if (value.length >= 2) {
      loadProdutosDisponiveis(value)
    } else if (value.length === 0) {
      loadProdutosDisponiveis()
    }
  }

  const handleSelecionarProduto = (produto: any) => {
    setProdutoSelecionado(produto)
    setValorUnitarioProduto(produto.VLRVENDA || 0)
  }

  const handleAdicionarProduto = async () => {
    if (!produtoSelecionado || !lead) {
      toast({
        title: "Atenção",
        description: "Selecione um produto",
        variant: "destructive",
      })
      return
    }

    if (quantidadeProduto <= 0) {
      toast({
        title: "Atenção",
        description: "A quantidade deve ser maior que zero",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    setLoadingMessage("Adicionando produto...")

    try {
      const vlrTotal = quantidadeProduto * valorUnitarioProduto

      const payload = {
        CODLEAD: String(lead.CODLEAD),
        CODPROD: produtoSelecionado.CODPROD,
        DESCRPROD: produtoSelecionado.DESCRPROD,
        QUANTIDADE: quantidadeProduto,
        VLRUNIT: valorUnitarioProduto,
        VLRTOTAL: vlrTotal
      }

      const response = await fetch('/api/leads/produtos/adicionar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao adicionar produto')
      }

      const resultado = await response.json()

      // Recarregar produtos do lead primeiro
      await loadProdutosLead(lead.CODLEAD)

      // Atualizar valor total do lead
      if (resultado.novoValorTotal !== undefined) {
        setFormData(prev => ({
          ...prev,
          VALOR: resultado.novoValorTotal
        }))
      }

      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso",
      })

      // Limpar formulário e fechar modal
      setShowAdicionarProdutoModal(false)
      setProdutoSelecionado(null)
      setQuantidadeProduto(1)
      setValorUnitarioProduto(0)
      setProdutoSearch("")

      // Recarregar a lista de leads para atualizar o valor no kanban
      await onSave()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      setLoadingMessage("")
    }
  }

  const handleEditarProduto = (produto: any) => {
    setProdutoSelecionadoEdicao(produto)
    setProdutoEditForm({
      quantidade: produto.QUANTIDADE,
      vlrunit: produto.VLRUNIT
    })
    setShowModalEdicaoProduto(true)
  }

  const handleSalvarEdicaoProduto = async () => {
    if (!produtoSelecionadoEdicao || !lead) return

    console.log('💾 Salvando edição do produto:', produtoSelecionadoEdicao)
    setIsSaving(true)
    setLoadingMessage("Atualizando produto...")

    try {
      const payload = {
        codItem: String(produtoSelecionadoEdicao.CODITEM),
        codLead: String(lead.CODLEAD),
        quantidade: Number(produtoEditForm.quantidade),
        vlrunit: Number(produtoEditForm.vlrunit)
      }

      console.log('📤 Payload sendo enviado:', payload)

      const response = await fetch('/api/leads/produtos/atualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar produto')
      }

      const resultado = await response.json()
      console.log('✅ Resultado da atualização:', resultado)

      // Recarregar produtos do lead primeiro
      await loadProdutosLead(lead.CODLEAD)

      // Atualizar valor total do lead no formData
      if (resultado.novoValorTotal !== undefined) {
        console.log('💰 Atualizando valor total do lead:', resultado.novoValorTotal)
        setFormData(prev => ({
          ...prev,
          VALOR: resultado.novoValorTotal
        }))
      }

      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso",
      })

      // Fechar modal e limpar formulário
      setShowModalEdicaoProduto(false)
      setProdutoSelecionadoEdicao(null)
      setProdutoEditForm({ quantidade: 0, vlrunit: 0 })

      // Recarregar a lista de leads para atualizar o valor no kanban
      await onSave()
    } catch (error: any) {
      console.error('❌ Erro ao salvar edição:', error)
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      setLoadingMessage("")
    }
  }

  const handleCriarAtividade = async () => {
    if (!lead || !atividadeForm.descricao) {
      toast({
        title: "Atenção",
        description: "Preencha a descrição da atividade",
        variant: "destructive",
      })
      return
    }

    const tipoMap: any = {
      'nota': 'NOTA',
      'email': 'EMAIL',
      'ligacao': 'LIGACAO',
      'whatsapp': 'WHATSAPP',
      'proposta': 'PROPOSTA',
      'reuniao': 'REUNIAO',
      'visita': 'VISITA'
    }

    // Cores predefinidas por tipo
    const coresMap: any = {
      'nota': '#EAB308',      // Amarelo
      'ligacao': '#9333EA',   // Roxo
      'email': '#3B82F6',     // Azul
      'whatsapp': '#22C55E',  // Verde
      'proposta': '#6B7280',  // Cinza
      'reuniao': '#F97316',   // Laranja
      'visita': '#000000'     // Preto
    }

    // Todos os tipos geram eventos no calendário
    const tiposComEvento = ['nota', 'email', 'ligacao', 'whatsapp', 'proposta', 'reuniao', 'visita']

    setIsSavingAtividade(true)

    try {
      // Criar atividade - manter a data/hora exata inserida pelo usuário
      // Adicionar 'Z' para forçar UTC e evitar conversão de fuso horário
      const dataInicio = atividadeForm.dataInicial + ':00.000Z';
      const dataFim = atividadeForm.dataFinal + ':00.000Z';

      const response = await fetch('/api/leads/atividades/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          CODLEAD: lead.CODLEAD,
          TIPO: tipoMap[activeAtividadeTab],
          DESCRICAO: atividadeForm.descricao,
          DADOS_COMPLEMENTARES: '',
          COR: coresMap[activeAtividadeTab],
          DATA_INICIO: dataInicio,
          DATA_FIM: dataFim
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar atividade')
      }

      const atividadeCriada = await response.json()

      // Atividade criada com sucesso - eventos removidos do sistema

      toast({
        title: "Sucesso",
        description: "Atividade registrada com sucesso",
      })

      setAtividadeForm({
        descricao: '',
        dataInicial: new Date().toISOString().slice(0, 16),
        dataFinal: new Date().toISOString().slice(0, 16)
      })

      // Recarregar atividades e eventos
      await Promise.all([
        loadAtividades(lead.CODLEAD),
        loadEventos(lead.CODLEAD)
      ])
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSavingAtividade(false)
    }
  }

  const handleStatusChange = async (status: 'EM_ANDAMENTO' | 'GANHO' | 'PERDIDO') => {
    if (!lead) return

    if (status === 'PERDIDO') {
      setShowPerdidoModal(true)
      return
    }

    if (status === 'GANHO') {
      setShowPedidoVendaModal(true)
      return
    }

    // EM_ANDAMENTO
    try {
      await atualizarStatusLead(lead.CODLEAD, status)
      toast({
        title: "Sucesso",
        description: "Lead marcado como Em Andamento",
      })
      onSave()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const confirmarPerdido = async () => {
    if (!lead || !motivoPerda.trim()) {
      toast({
        title: "Atenção",
        description: "Informe o motivo da perda",
        variant: "destructive",
      })
      return
    }

    try {
      await atualizarStatusLead(lead.CODLEAD, 'PERDIDO', motivoPerda)
      toast({
        title: "Sucesso",
        description: "Lead marcado como Perdido",
      })
      setShowPerdidoModal(false)
      setMotivoPerda("")
      onSave()
      onClose()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.CODPARC) {
      toast({
        title: "Atenção",
        description: "Por favor, selecione um parceiro.",
        variant: "destructive",
      })
      return
    }

    if (!formData.CODFUNIL && !funilSelecionado) {
      toast({
        title: "Atenção",
        description: "Nenhum funil foi selecionado.",
        variant: "destructive",
      })
      return
    }

    if (!formData.CODESTAGIO) {
      toast({
        title: "Atenção",
        description: "Por favor, selecione um estágio.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    setLoadingMessage(lead ? "Atualizando lead..." : "Criando lead...")

    try {
      const dataToSave = {
        ...(lead && { CODLEAD: String(lead.CODLEAD) }),
        NOME: String(formData.NOME || ""),
        DESCRICAO: String(formData.DESCRICAO || ""),
        VALOR: Number(formData.VALOR || 0),
        CODESTAGIO: String(formData.CODESTAGIO || ""),
        CODFUNIL: String(formData.CODFUNIL || funilSelecionado?.CODFUNIL || ""),
        DATA_VENCIMENTO: String(formData.DATA_VENCIMENTO || ""),
        TIPO_TAG: String(formData.TIPO_TAG || ""),
        COR_TAG: String(formData.COR_TAG || "#3b82f6"),
        CODPARC: String(formData.CODPARC || "")
      }

      const response = await fetch('/api/leads/salvar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao salvar lead')
      }

      toast({
        title: "Sucesso",
        description: lead ? "Lead atualizado com sucesso!" : "Lead criado com sucesso!",
      })

      onSave()
      onClose()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar lead. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      setLoadingMessage("")
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    try {
      // Se a data já está no formato DD/MM/YYYY
      if (dateString.includes('/')) {
        return dateString
      }
      // Se a data está no formato ISO ou YYYY-MM-DD
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      return date.toLocaleDateString('pt-BR')
    } catch (e) {
      return ''
    }
  }

  const [activeTab, setActiveTab] = useState<'atividades' | 'valor' | 'dados'>('atividades')

  if (!isOpen) return null

  if (isInitializing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-lg border">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-foreground">Carregando dados...</p>
        </div>
      </div>
    )
  }

  const parceiroSelecionado = parceiros.find(p => p.CODPARC === formData.CODPARC)
  const estagioAtual = estagios.find(e => e.CODESTAGIO === formData.CODESTAGIO)
  const currentUser = lead ? { name: 'Usuário Atual' } : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {isSaving && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="relative flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-lg border">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-foreground">{loadingMessage}</p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!isSaving ? onClose : undefined} />

      <div className="relative bg-card rounded-lg shadow-xl w-full max-w-7xl mx-4 max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b bg-background/50 px-4 md:px-6 py-4 md:py-3">
          <div className="flex items-center justify-between mb-4 md:mb-3">
            <div className="flex items-center gap-2 md:gap-3 flex-wrap flex-1">
              <h2 className="text-sm md:text-lg font-bold text-foreground break-words">
                {lead ? `${lead.CODLEAD} - ${formData.NOME}` : "Novo Lead"}
              </h2>
              <span className="text-[10px] md:text-sm text-muted-foreground whitespace-nowrap">Período indefinido</span>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                <span className="text-[10px] md:text-sm text-muted-foreground whitespace-nowrap">{currentUser?.name || 'Usuário'}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors ml-2 flex-shrink-0">
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          {/* Funil Progress - Estilo horizontal e responsivo */}
          {estagios.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-2 mb-4 md:mb-3">
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>{funilSelecionado?.NOME || 'Funil de Vendas'}</span>
              </div>
              <div className="flex items-center flex-1 relative overflow-x-auto">
                {estagios.sort((a, b) => a.ORDEM - b.ORDEM).map((estagio, index) => {
                  const isActive = estagio.CODESTAGIO === formData.CODESTAGIO;
                  const isPast = index < estagios.findIndex(e => e.CODESTAGIO === formData.CODESTAGIO);

                  return (
                    <div
                      key={estagio.CODESTAGIO}
                      className={`
                        relative px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-medium
                        ${isActive ? 'bg-primary text-primary-foreground' : isPast ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}
                        ${index === 0 ? 'rounded-l-md pl-3 md:pl-4' : 'pl-4 md:pl-5'}
                        ${index === estagios.length - 1 ? 'rounded-r-md pr-3 md:pr-4' : 'pr-2 md:pr-3'}
                        transition-all duration-200
                        flex items-center justify-center
                        flex-1 min-w-fit
                      `}
                      style={{
                        clipPath: index === estagios.length - 1
                          ? undefined
                          : 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%, 8px 50%)',
                        marginRight: index === estagios.length - 1 ? '0' : '-8px',
                        zIndex: estagios.length - index
                      }}
                    >
                      <span className="relative whitespace-nowrap">{estagio.NOME}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Container: Opções do Cabeçalho - Estilo Pills */}
          {lead && (
            <div className="flex items-center gap-2 flex-wrap mt-3 md:mt-0">
              <button
                onClick={() => handleStatusChange('PERDIDO')}
                className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-white border border-red-200 text-red-700 rounded-md hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
              >
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-xs md:text-sm font-medium">Perdido</span>
              </button>

              <button
                onClick={() => handleStatusChange('EM_ANDAMENTO')}
                className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-white border border-orange-200 text-orange-700 rounded-md hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-200"
              >
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs md:text-sm font-medium">Em andamento</span>
              </button>

              <button
                onClick={() => handleStatusChange('GANHO')}
                className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-white border border-green-200 text-green-700 rounded-md hover:bg-green-500 hover:text-white hover:border-green-500 transition-all duration-200"
              >
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs md:text-sm font-medium">Ganho</span>
              </button>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-500 hover:text-white hover:border-gray-500 transition-all duration-200">
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span className="text-xs md:text-sm font-medium">Mais opções</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setNovoTitulo(formData.NOME || "")
                        setShowEditarTituloModal(true)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors text-left"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar título
                    </button>
                    <button
                      onClick={() => setShowAlterarEstagioModal(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors text-left"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Alterar estágio
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 space-y-4 md:space-y-6 scrollbar-hide">
            <style jsx>{`
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {/* Mobile Tabs - apenas para leads existentes */}
            {lead && (
              <div className="md:hidden">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="atividades" className="text-xs">Atividades</TabsTrigger>
                    <TabsTrigger value="valor" className="text-xs">Valor</TabsTrigger>
                    <TabsTrigger value="dados" className="text-xs">Dados</TabsTrigger>
                  </TabsList>

                  <TabsContent value="atividades" className="space-y-4">
                    {/* Ações Rápidas */}
                    <div className="bg-white rounded-lg shadow-sm border p-3">
                      <h3 className="text-xs font-semibold text-foreground mb-2">Ações Rápidas</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs h-8">
                          <Mail className="w-3 h-3 mr-1" />
                          E-mail
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs h-8">
                          <Phone className="w-3 h-3 mr-1" />
                          Ligação
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs h-8">
                          <FileText className="w-3 h-3 mr-1" />
                          Proposta
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs h-8">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          WhatsApp
                        </Button>
                      </div>
                    </div>

                    {/* Registrar Atividade */}
                    <div className="bg-white rounded-lg shadow-sm border p-3">
                      <h3 className="text-xs font-semibold text-foreground mb-2">Registrar Atividade</h3>
                      <div className="flex gap-1 mb-3 flex-wrap overflow-x-auto">
                        <button
                          onClick={() => setActiveAtividadeTab('nota')}
                          className={`px-2 py-1 text-[10px] font-medium flex items-center gap-1 rounded-md transition-colors whitespace-nowrap ${
                            activeAtividadeTab === 'nota' ? 'text-white' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'
                          }`}
                          style={activeAtividadeTab === 'nota' ? { backgroundColor: '#EAB308' } : {}}
                        >
                          <FileText className="w-3 h-3" />
                          Nota
                        </button>
                        <button
                          onClick={() => setActiveAtividadeTab('ligacao')}
                          className={`px-2 py-1 text-[10px] font-medium flex items-center gap-1 rounded-md transition-colors whitespace-nowrap ${
                            activeAtividadeTab === 'ligacao' ? 'text-white' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'
                          }`}
                          style={activeAtividadeTab === 'ligacao' ? { backgroundColor: '#9333EA' } : {}}
                        >
                          <Phone className="w-3 h-3" />
                          Ligação
                        </button>
                        <button
                          onClick={() => setActiveAtividadeTab('email')}
                          className={`px-2 py-1 text-[10px] font-medium flex items-center gap-1 rounded-md transition-colors whitespace-nowrap ${
                            activeAtividadeTab === 'email' ? 'text-white' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'
                          }`}
                          style={activeAtividadeTab === 'email' ? { backgroundColor: '#3B82F6' } : {}}
                        >
                          <Mail className="w-3 h-3" />
                          E-mail
                        </button>
                        <button
                          onClick={() => setActiveAtividadeTab('whatsapp')}
                          className={`px-2 py-1 text-[10px] font-medium flex items-center gap-1 rounded-md transition-colors whitespace-nowrap ${
                            activeAtividadeTab === 'whatsapp' ? 'text-white' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'
                          }`}
                          style={activeAtividadeTab === 'whatsapp' ? { backgroundColor: '#22C55E' } : {}}
                        >
                          <MessageSquare className="w-3 h-3" />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => setActiveAtividadeTab('proposta')}
                          className={`px-2 py-1 text-[10px] font-medium flex items-center gap-1 rounded-md transition-colors whitespace-nowrap ${
                            activeAtividadeTab === 'proposta' ? 'text-white' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'
                          }`}
                          style={activeAtividadeTab === 'proposta' ? { backgroundColor: '#6B7280' } : {}}
                        >
                          <FileText className="w-3 h-3" />
                          Proposta
                        </button>
                        <button
                          onClick={() => setActiveAtividadeTab('reuniao')}
                          className={`px-2 py-1 text-[10px] font-medium flex items-center gap-1 rounded-md transition-colors whitespace-nowrap ${
                            activeAtividadeTab === 'reuniao' ? 'text-white' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'
                          }`}
                          style={activeAtividadeTab === 'reuniao' ? { backgroundColor: '#F97316' } : {}}
                        >
                          <Users className="w-3 h-3" />
                          Reunião
                        </button>
                        <button
                          onClick={() => setActiveAtividadeTab('visita')}
                          className={`px-2 py-1 text-[10px] font-medium flex items-center gap-1 rounded-md transition-colors whitespace-nowrap ${
                            activeAtividadeTab === 'visita' ? 'text-white' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'
                          }`}
                          style={activeAtividadeTab === 'visita' ? { backgroundColor: '#000000' } : {}}
                        >
                          <CalendarIcon className="w-3 h-3" />
                          Visita
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="dataInicial" className="text-xs mb-1 block">Data Inicial</Label>
                            <Input
                              id="dataInicial"
                              type="datetime-local"
                              value={atividadeForm.dataInicial}
                              onChange={(e) => setAtividadeForm({ ...atividadeForm, dataInicial: e.target.value })}
                              disabled={isSavingAtividade}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label htmlFor="dataFinal" className="text-xs mb-1 block">Data Final</Label>
                            <Input
                              id="dataFinal"
                              type="datetime-local"
                              value={atividadeForm.dataFinal}
                              onChange={(e) => setAtividadeForm({ ...atividadeForm, dataFinal: e.target.value })}
                              disabled={isSavingAtividade}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        <Textarea
                          placeholder="O que foi feito e qual o próximo passo?"
                          value={atividadeForm.descricao}
                          onChange={(e) => setAtividadeForm({ ...atividadeForm, descricao: e.target.value })}
                          rows={2}
                          className="resize-none text-xs"
                          disabled={isSavingAtividade}
                        />
                        <div className="flex justify-end">
                          <Button onClick={handleCriarAtividade} size="sm" disabled={isSavingAtividade}>
                            {isSavingAtividade ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Salvando...
                              </>
                            ) : (
                              'Salvar atividade'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Histórico de Atividades */}
                    <div className="bg-white rounded-lg shadow-sm border p-3">
                      <h3 className="text-xs font-semibold text-foreground mb-2">Histórico de Atividades</h3>
                      {isLoadingAtividades ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : atividades.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-3 opacity-50">
                            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="100" cy="100" r="80" fill="#E5E7EB"/>
                              <path d="M60 120L80 140L140 80" stroke="white" strokeWidth="8" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-foreground">Nenhuma atividade registrada</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Que tal agendar uma ligação para evoluir este negócio?
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {atividades.map((atividade, index) => (
                            <AtividadeItem
                              key={atividade.CODATIVIDADE || index}
                              atividade={atividade}
                              codLead={lead!.CODLEAD}
                              onReload={() => loadAtividades(lead!.CODLEAD)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="valor" className="space-y-4">
                    {/* Valor do Negócio */}
                    <div className="bg-white rounded-lg shadow-sm border p-3">
                      <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                        <DollarSign className="w-3 h-3 text-primary" />
                        Valor do Negócio
                      </h3>
                      <div className="text-xl font-bold text-foreground mb-2">
                        {formatCurrency(formData.VALOR || 0)}
                      </div>
                      <p className="text-[10px] text-muted-foreground mb-2">Produtos e serviços</p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs text-muted-foreground">Produtos vinculados:</Label>
                          <Button 
                            size="sm" 
                            onClick={() => setShowAdicionarProdutoModal(true)}
                            className="h-6 text-xs px-2"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                        {isLoadingProdutos ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : produtosLead.length > 0 ? (
                          produtosLead.map((produto, index) => (
                            <div key={produto.CODITEM || index} className="text-xs p-2 bg-gray-50 rounded border flex justify-between items-center">
                              <div className="flex-1">
                                <div className="font-medium">{produto.DESCRPROD}</div>
                                <div className="text-muted-foreground mt-1">
                                  Qtd: {produto.QUANTIDADE} × {formatCurrency(produto.VLRUNIT)} = {formatCurrency(produto.VLRTOTAL)}
                                </div>
                              </div>
                              <div className="flex gap-1 ml-2">
                                <button
                                  onClick={() => handleEditarProduto(produto)}
                                  className="text-blue-500 hover:text-blue-700 transition-colors"
                                  title="Editar produto"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleRemoverProduto(produto.CODITEM!)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                  title="Remover produto"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">Nenhum produto vinculado</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="dados" className="space-y-4">
                    {/* Dados do Negócio */}
                    <div className="bg-white rounded-lg shadow-sm border p-3">
                      <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                        <FileText className="w-3 h-3 text-primary" />
                        Dados do Negócio
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Responsável</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{currentUser?.name || 'Você'}</span>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">Data de início</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">Hoje</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="DATA_VENCIMENTO_MOBILE" className="text-xs">Data de conclusão</Label>
                          <Input
                            id="DATA_VENCIMENTO_MOBILE"
                            type="date"
                            value={formData.DATA_VENCIMENTO}
                            onChange={(e) => setFormData({ ...formData, DATA_VENCIMENTO: e.target.value })}
                            className="text-sm h-8"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="DESCRICAO_MOBILE" className="text-xs">Descrição</Label>
                          <Textarea
                            id="DESCRICAO_MOBILE"
                            value={formData.DESCRICAO}
                            onChange={(e) => setFormData({ ...formData, DESCRICAO: e.target.value })}
                            rows={3}
                            className="text-sm resize-none"
                            placeholder="Adicionar descrição"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">Cadastrado por</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{currentUser?.name || 'Usuário'}</span>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">Data de cadastro</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">Hoje às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">Última atualização</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">Hoje às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dados do Contato */}
                    <div className="bg-white rounded-lg shadow-sm border p-3">
                      <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                        <User className="w-3 h-3 text-primary" />
                        Dados do Contato
                      </h3>

                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="parceiro-mobile" className="text-xs">Parceiro *</Label>
                          <Select
                            value={formData.CODPARC ? String(formData.CODPARC) : undefined}
                            onValueChange={(value) => setFormData({ ...formData, CODPARC: String(value) })}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Selecione um parceiro" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2">
                                <Input
                                  placeholder="Buscar parceiro..."
                                  value={partnerSearch}
                                  onChange={(e) => handlePartnerSearch(e.target.value)}
                                  className="h-8 text-sm"
                                />
                              </div>
                              {isLoadingPartners ? (
                                <SelectItem value="loading" disabled>Carregando...</SelectItem>
                              ) : parceiros.length === 0 ? (
                                <SelectItem value="empty" disabled>
                                  {partnerSearch ? "Nenhum parceiro encontrado" : "Digite para buscar"}
                                </SelectItem>
                              ) : (
                                parceiros.map((partner) => (
                                  <SelectItem key={partner.CODPARC} value={partner.CODPARC}>
                                    {partner.NOMEPARC} - {partner.CGC_CPF}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Desktop Content - Mantém o layout original */}
            <div className="hidden md:block space-y-6">
            {/* Container: Ações Rápidas - Desktop */}
            {lead && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Ações Rápidas</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-sm h-9">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>Enviar </span>E-mail
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-sm h-9">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>Fazer </span>Ligação
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-sm h-9">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Gerar </span>Proposta
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-sm h-9">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            )}

            {/* Container: Registrar Atividade - Desktop */}
            {lead && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Registrar Atividade</h3>
                <div className="flex gap-2 mb-4 flex-wrap overflow-x-auto">
                  <button
                    onClick={() => setActiveAtividadeTab('nota')}
                    className={`px-3 py-1.5 text-xs font-medium flex items-center gap-2 rounded-md transition-colors whitespace-nowrap ${
                      activeAtividadeTab === 'nota' ? 'text-white' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'
                    }`}
                    style={activeAtividadeTab === 'nota' ? { backgroundColor: '#EAB308' } : {}}
                  >
                    <FileText className="w-3 h-3" />
                    Nota
                  </button>
                  <button
                    onClick={() => setActiveAtividadeTab('ligacao')}
                    className={`px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-medium flex items-center gap-1 md:gap-2 rounded-md transition-colors whitespace-nowrap ${
                      activeAtividadeTab === 'ligacao' ? 'text-white' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'
                    }`}
                    style={activeAtividadeTab === 'ligacao' ? { backgroundColor: '#9333EA' } : {}}
                  >
                    <Phone className="w-3 h-3" />
                    Ligação
                  </button>
                  <button
                    onClick={() => setActiveAtividadeTab('email')}
                    className={`px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-medium flex items-center gap-1 md:gap-2 rounded-md transition-colors whitespace-nowrap ${
                      activeAtividadeTab === 'email' ? 'text-white' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'
                    }`}
                    style={activeAtividadeTab === 'email' ? { backgroundColor: '#3B82F6' } : {}}
                  >
                    <Mail className="w-3 h-3" />
                    E-mail
                  </button>
                  <button
                    onClick={() => setActiveAtividadeTab('whatsapp')}
                    className={`px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-medium flex items-center gap-1 md:gap-2 rounded-md transition-colors whitespace-nowrap ${
                      activeAtividadeTab === 'whatsapp' ? 'text-white' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'
                    }`}
                    style={activeAtividadeTab === 'whatsapp' ? { backgroundColor: '#22C55E' } : {}}
                  >
                    <MessageSquare className="w-3 h-3" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setActiveAtividadeTab('proposta')}
                    className={`px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-medium flex items-center gap-1 md:gap-2 rounded-md transition-colors whitespace-nowrap ${
                      activeAtividadeTab === 'proposta' ? 'text-white' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'
                    }`}
                    style={activeAtividadeTab === 'proposta' ? { backgroundColor: '#6B7280' } : {}}
                  >
                    <FileText className="w-3 h-3" />
                    Proposta
                  </button>
                  <button
                    onClick={() => setActiveAtividadeTab('reuniao')}
                    className={`px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-medium flex items-center gap-1 md:gap-2 rounded-md transition-colors whitespace-nowrap ${
                      activeAtividadeTab === 'reuniao' ? 'text-white' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'
                    }`}
                    style={activeAtividadeTab === 'reuniao' ? { backgroundColor: '#F97316' } : {}}
                  >
                    <Users className="w-3 h-3" />
                    Reunião
                  </button>
                  <button
                    onClick={() => setActiveAtividadeTab('visita')}
                    className={`px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-medium flex items-center gap-1 md:gap-2 rounded-md transition-colors whitespace-nowrap ${
                      activeAtividadeTab === 'visita' ? 'text-white' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'
                    }`}
                    style={activeAtividadeTab === 'visita' ? { backgroundColor: '#000000' } : {}}
                  >
                    <CalendarIcon className="w-3 h-3" />
                    Visita
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="dataInicial" className="text-xs mb-1 block">Data Início</Label>
                      <Input
                        id="dataInicial"
                        type="datetime-local"
                        value={atividadeForm.dataInicial}
                        onChange={(e) => setAtividadeForm({ ...atividadeForm, dataInicial: e.target.value })}
                        disabled={isSavingAtividade}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dataFinal" className="text-xs mb-1 block">Data Fim</Label>
                      <Input
                        id="dataFinal"
                        type="datetime-local"
                        value={atividadeForm.dataFinal}
                        onChange={(e) => setAtividadeForm({ ...atividadeForm, dataFinal: e.target.value })}
                        disabled={isSavingAtividade}
                      />
                    </div>
                  </div>
                  <Textarea
                    placeholder="O que foi feito e qual o próximo passo?"
                    value={atividadeForm.descricao}
                    onChange={(e) => setAtividadeForm({ ...atividadeForm, descricao: e.target.value })}
                    rows={3}
                    className="resize-none"
                    disabled={isSavingAtividade}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleCriarAtividade} size="sm" disabled={isSavingAtividade}>
                      {isSavingAtividade ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Salvando...
                        </>
                      ) : (
                        'Salvar atividade'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Container: Histórico de Atividades - Desktop */}
            {lead && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Histórico de Atividades</h3>
                {isLoadingAtividades ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : atividades.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 opacity-50">
                      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="100" cy="100" r="80" fill="#E5E7EB"/>
                        <path d="M60 120L80 140L140 80" stroke="white" strokeWidth="8" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-foreground">Nenhuma atividade registrada</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Que tal agendar uma ligação para evoluir este negócio?
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {atividades.map((atividade, index) => (
                      <AtividadeItem
                        key={atividade.CODATIVIDADE || index}
                        atividade={atividade}
                        codLead={lead!.CODLEAD}
                        onReload={() => loadAtividades(lead!.CODLEAD)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            </div>
          </div>

          {/* Sidebar direita - Desktop apenas */}
          <div className="hidden md:block w-80 border-l bg-gray-50 overflow-y-auto p-6 space-y-4 scrollbar-hide">
            {/* Container: Valor do Negócio */}
            <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
              <h3 className="text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3 flex items-center gap-2">
                <DollarSign className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                Valor do Negócio
              </h3>
              <div className="text-xl md:text-2xl font-bold text-foreground mb-2">
                {formatCurrency(formData.VALOR || 0)}
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground mb-2 md:mb-3">Produtos e serviços</p>
              {!lead && (
                <div className="space-y-2">
                  <Label htmlFor="VALOR" className="text-xs">Valor (R$)</Label>
                  <Input
                    id="VALOR"
                    type="number"
                    step="0.01"
                    value={formData.VALOR}
                    onChange={(e) => setFormData({ ...formData, VALOR: Number(e.target.value) })}
                  />
                </div>
              )}
              {lead && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-muted-foreground">Produtos vinculados:</Label>
                    <Button 
                      size="sm" 
                      onClick={() => setShowAdicionarProdutoModal(true)}
                      className="h-7 text-xs px-2"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  {isLoadingProdutos ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : produtosLead.length > 0 ? (
                    produtosLead.map((produto, index) => (
                      <div key={produto.CODITEM || index} className="text-xs p-2 bg-gray-50 rounded border flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium">{produto.DESCRPROD}</div>
                          <div className="text-muted-foreground mt-1">
                            Qtd: {produto.QUANTIDADE} × {formatCurrency(produto.VLRUNIT)} = {formatCurrency(produto.VLRTOTAL)}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => handleEditarProduto(produto)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="Editar produto"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemoverProduto(produto.CODITEM!)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Remover produto"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">Nenhum produto vinculado</p>
                  )}
                </div>
              )}
            </div>

            {/* Container: Dados do Negócio */}
            <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
              <h3 className="text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3 flex items-center gap-2">
                <FileText className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                Dados do Negócio
              </h3>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Responsável</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{currentUser?.name || 'Você'}</span>
                  </div>
                </div>

                {!lead && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="NOME" className="text-xs">Nome do Negócio *</Label>
                      <Input
                        id="NOME"
                        value={formData.NOME}
                        onChange={(e) => setFormData({ ...formData, NOME: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="CODESTAGIO" className="text-xs">Estágio *</Label>
                      <Select
                        value={formData.CODESTAGIO}
                        onValueChange={(value) => setFormData({ ...formData, CODESTAGIO: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um estágio" />
                        </SelectTrigger>
                        <SelectContent>
                          {estagios.map((estagio) => (
                            <SelectItem key={estagio.CODESTAGIO} value={estagio.CODESTAGIO}>
                              {estagio.NOME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div>
                  <Label className="text-xs text-muted-foreground">Data de início</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Hoje</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="DATA_VENCIMENTO" className="text-xs">Data de conclusão</Label>
                  <Input
                    id="DATA_VENCIMENTO"
                    type="date"
                    value={formData.DATA_VENCIMENTO}
                    onChange={(e) => setFormData({ ...formData, DATA_VENCIMENTO: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="DESCRICAO" className="text-xs">Descrição</Label>
                  <Textarea
                    id="DESCRICAO"
                    value={formData.DESCRICAO}
                    onChange={(e) => setFormData({ ...formData, DESCRICAO: e.target.value })}
                    rows={3}
                    placeholder="Adicionar descrição"
                  />
                </div>

                {lead && (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground">Cadastrado por</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{currentUser?.name || 'Usuário'}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Data de cadastro</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Hoje às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Última atualização</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Hoje às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Container: Dados do Contato */}
            <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
              <h3 className="text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3 flex items-center gap-2">
                <User className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                Dados do Contato
              </h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="parceiro" className="text-xs">Parceiro *</Label>
                  <Select
                    value={formData.CODPARC ? String(formData.CODPARC) : undefined}
                    onValueChange={(value) => setFormData({ ...formData, CODPARC: String(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um parceiro" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Buscar parceiro..."
                          value={partnerSearch}
                          onChange={(e) => handlePartnerSearch(e.target.value)}
                        />
                      </div>
                      {isLoadingPartners ? (
                        <SelectItem value="loading" disabled>Carregando...</SelectItem>
                      ) : parceiros.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          {partnerSearch ? "Nenhum parceiro encontrado" : "Digite para buscar"}
                        </SelectItem>
                      ) : (
                        parceiros.map((partner) => (
                          <SelectItem key={partner.CODPARC} value={partner.CODPARC}>
                            {partner.NOMEPARC} - {partner.CGC_CPF}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {!lead && (
                  <div className="space-y-2">
                    <Label htmlFor="TIPO_TAG" className="text-xs">Tipo de Tag *</Label>
                    <Select
                      value={formData.TIPO_TAG}
                      onValueChange={(value) => setFormData({ ...formData, TIPO_TAG: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma tag" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_TAG.map((tag) => (
                          <SelectItem key={tag} value={tag}>
                            {tag}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Botões de ação */}
            {!lead && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={isSaving}
                >
                  {isSaving ? "Criando..." : "Criar Lead"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edição de Produto */}
      <Dialog open={showModalEdicaoProduto} onOpenChange={setShowModalEdicaoProduto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {produtoSelecionadoEdicao && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">{produtoSelecionadoEdicao.DESCRPROD}</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Quantidade</Label>
                  <Input
                    type="number"
                    value={produtoEditForm.quantidade}
                    onChange={(e) => setProdutoEditForm({ ...produtoEditForm, quantidade: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Valor Unit.</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={produtoEditForm.vlrunit}
                    onChange={(e) => setProdutoEditForm({ ...produtoEditForm, vlrunit: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded border">
                <div className="text-sm font-medium text-muted-foreground">Total</div>
                <div className="text-xl font-bold text-green-700">
                  {formatCurrency(produtoEditForm.quantidade * produtoEditForm.vlrunit)}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowModalEdicaoProduto(false)
                    setProdutoSelecionadoEdicao(null)
                    setProdutoEditForm({ quantidade: 0, vlrunit: 0 })
                  }}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSalvarEdicaoProduto} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar Produto */}
      <Dialog open={showAdicionarProdutoModal} onOpenChange={setShowAdicionarProdutoModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Produto ao Negócio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Produto *</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Buscar produto..."
                  value={produtoSearch}
                  onChange={(e) => handleProdutoSearch(e.target.value)}
                />
                {isLoadingProdutosDisponiveis ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : produtos.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto border rounded-md">
                    {produtos.map((produto) => (
                      <button
                        key={produto.CODPROD}
                        onClick={() => handleSelecionarProduto(produto)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors border-b last:border-b-0 ${
                          produtoSelecionado?.CODPROD === produto.CODPROD ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="font-medium">{produto.DESCRPROD}</div>
                        <div className="text-xs text-muted-foreground">
                          Código: {produto.CODPROD} | Preço: {formatCurrency(produto.VLRVENDA || 0)}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : produtoSearch ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum produto encontrado
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Digite para buscar produtos
                  </p>
                )}
              </div>
            </div>

            {produtoSelecionado && (
              <>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-sm font-medium">{produtoSelecionado.DESCRPROD}</p>
                  <p className="text-xs text-muted-foreground">Código: {produtoSelecionado.CODPROD}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Quantidade *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantidadeProduto}
                      onChange={(e) => setQuantidadeProduto(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Valor Unit. *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={valorUnitarioProduto}
                      onChange={(e) => setValorUnitarioProduto(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded border">
                  <div className="text-sm font-medium text-muted-foreground">Total</div>
                  <div className="text-xl font-bold text-green-700">
                    {formatCurrency(quantidadeProduto * valorUnitarioProduto)}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAdicionarProdutoModal(false)
                  setProdutoSelecionado(null)
                  setQuantidadeProduto(1)
                  setValorUnitarioProduto(0)
                  setProdutoSearch("")
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleAdicionarProduto}
                disabled={!produtoSelecionado || quantidadeProduto <= 0}
              >
                Adicionar Produto
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Título */}
      <Dialog open={showEditarTituloModal} onOpenChange={setShowEditarTituloModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Título do Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Título Atual</Label>
              <div className="p-3 bg-gray-50 rounded border">
                <p className="text-sm font-medium">{formData.NOME}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Novo Título *</Label>
              <Input
                value={novoTitulo}
                onChange={(e) => setNovoTitulo(e.target.value)}
                placeholder="Digite o novo título"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditarTituloModal(false)
                  setNovoTitulo("")
                }}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button 
                onClick={async () => {
                  if (!lead || !novoTitulo.trim()) {
                    toast({
                      title: "Atenção",
                      description: "Informe o novo título",
                      variant: "destructive",
                    })
                    return
                  }

                  setIsSaving(true)
                  setLoadingMessage("Atualizando título...")

                  try {
                    const response = await fetch('/api/leads/salvar', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        CODLEAD: lead.CODLEAD,
                        NOME: novoTitulo,
                        DESCRICAO: formData.DESCRICAO,
                        VALOR: formData.VALOR,
                        CODESTAGIO: formData.CODESTAGIO,
                        CODFUNIL: formData.CODFUNIL,
                        DATA_VENCIMENTO: formData.DATA_VENCIMENTO,
                        TIPO_TAG: formData.TIPO_TAG,
                        COR_TAG: formData.COR_TAG,
                        CODPARC: formData.CODPARC
                      })
                    })

                    if (!response.ok) throw new Error('Erro ao atualizar título')

                    toast({
                      title: "Sucesso",
                      description: "Título atualizado com sucesso!",
                    })

                    setFormData({ ...formData, NOME: novoTitulo })
                    setShowEditarTituloModal(false)
                    setNovoTitulo("")
                    onSave()

                  } catch (error: any) {
                    toast({
                      title: "Erro",
                      description: error.message,
                      variant: "destructive",
                    })
                  } finally {
                    setIsSaving(false)
                    setLoadingMessage("")
                  }
                }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Título'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Lead Perdido */}
      <Dialog open={showPerdidoModal} onOpenChange={setShowPerdidoModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Marcar Lead como Perdido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Motivo da Perda *</Label>
              <Textarea
                value={motivoPerda}
                onChange={(e) => setMotivoPerda(e.target.value)}
                placeholder="Descreva o motivo da perda..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPerdidoModal(false)
                  setMotivoPerda("")
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmarPerdido}
                className="bg-red-600 hover:bg-red-700"
              >
                Confirmar Perda
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Pedido de Venda */}
      <Dialog open={showPedidoVendaModal} onOpenChange={setShowPedidoVendaModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Pedido de Venda - Lead Ganho</DialogTitle>
          </DialogHeader>
          {lead && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>Lead:</strong> {lead.NOME} - {formatCurrency(formData.VALOR || 0)}
                </p>
              </div>
              {/* Aqui será integrado o componente de pedido de venda */}
              <p className="text-sm text-muted-foreground">
                O formulário de pedido será preenchido automaticamente com os dados do lead.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Alterar Estágio */}
      <Dialog open={showAlterarEstagioModal} onOpenChange={setShowAlterarEstagioModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Estágio do Negócio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Estágio Atual</Label>
              <div className="p-3 bg-gray-50 rounded border">
                <p className="text-sm font-medium">{estagioAtual?.NOME || 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Novo Estágio *</Label>
              <Select
                value={formData.CODESTAGIO}
                onValueChange={(value) => setFormData({ ...formData, CODESTAGIO: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um estágio" />
                </SelectTrigger>
                <SelectContent>
                  {estagios.sort((a, b) => a.ORDEM - b.ORDEM).map((estagio) => (
                    <SelectItem key={estagio.CODESTAGIO} value={estagio.CODESTAGIO}>
                      {estagio.NOME}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowAlterarEstagioModal(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button 
                onClick={async () => {
                  if (!lead) return

                  setIsSaving(true)
                  setLoadingMessage("Atualizando estágio...")

                  try {
                    const response = await fetch('/api/leads/atualizar-estagio', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        codLeed: lead.CODLEAD, 
                        novoEstagio: formData.CODESTAGIO 
                      })
                    })

                    if (!response.ok) {
                      throw new Error('Erro ao atualizar estágio')
                    }

                    toast({
                      title: "Sucesso",
                      description: "Estágio atualizado com sucesso!",
                    })

                    setShowAlterarEstagioModal(false)
                    onSave()

                  } catch (error: any) {
                    toast({
                      title: "Erro",
                      description: error.message,
                      variant: "destructive",
                    })
                  } finally {
                    setIsSaving(false)
                    setLoadingMessage("")
                  }
                }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Alterando...
                  </>
                ) : (
                  'Alterar Estágio'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}