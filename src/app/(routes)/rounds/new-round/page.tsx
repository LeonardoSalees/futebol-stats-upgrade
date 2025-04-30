// app/new-round/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Plus, Trophy, Users } from 'lucide-react'
import { motion } from 'framer-motion'

export default function NewRoundPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleCreateRound = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.post('/api/rounds', {})
      
      // Verifica se já existe uma rodada no dia
      if (response.data.existingRound && response.data.round) {
        // Redireciona para a rodada existente
        router.push(`/rounds/${response.data.round.id}`)
        return
      }
  
      // Se não existir, verifica se a resposta contém um ID válido
      if (response.data && response.data.id) {
        router.push(`/rounds/${response.data.id}`)
      } else {
        setError('Resposta inválida do servidor')
        console.error('Resposta inválida:', response.data)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao criar rodada')
      console.error('Erro ao criar rodada:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Nova Rodada</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-xl shadow-lg p-6 space-y-6 text-white"
      >
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Trophy className="h-8 w-8 text-white" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-center">Criar Nova Rodada</h2>

      <div className="space-y-4">
          <div className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-400" />
            <p className="text-sm">A rodada será criada com a data atual</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-lg">
            <Plus className="h-5 w-5 text-green-400" />
            <p className="text-sm">Número sequencial automático</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-lg">
            <Users className="h-5 w-5 text-amber-400" />
            <p className="text-sm">Adicione jogos após a criação</p>
          </div>
        </div>

        <Button
          onClick={handleCreateRound}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg font-medium"
          disabled={loading}
        >
          {loading ? 'Criando...' : 'Criar Nova Rodada'}
        </Button>

        {error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-center text-sm bg-red-900/30 p-3 rounded-lg"
          >
            Erro: {error}
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}
