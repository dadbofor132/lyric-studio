import { useCallback, useMemo, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { LyricBlockNode } from './LyricBlockNode'
import { CanvasToolbar } from './CanvasToolbar'
import { useSongStore } from '../../stores/songStore'
import { getBlockColor } from '../../lib/utils'
import type { Block } from '../../types'

const nodeTypes = {
  lyricBlock: LyricBlockNode,
}

export function Canvas() {
  const { blocks, currentSong, updateBlock, selectBlock } = useSongStore()

  // Convert blocks to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    return blocks.map(block => ({
      id: block.id,
      type: 'lyricBlock',
      position: { x: block.positionX, y: block.positionY },
      data: { block },
      style: { width: block.width || 300 },
    }))
  }, [blocks])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Update nodes when blocks change
  useEffect(() => {
    setNodes(
      blocks.map(block => ({
        id: block.id,
        type: 'lyricBlock',
        position: { x: block.positionX, y: block.positionY },
        data: { block },
        style: { width: block.width || 300 },
      }))
    )
  }, [blocks, setNodes])

  const handleNodesChange = useCallback(
    (changes: NodeChange<Node>[]) => {
      onNodesChange(changes)

      // Save position changes to database
      changes.forEach(change => {
        if (change.type === 'position' && change.position && change.dragging === false) {
          updateBlock(change.id, {
            positionX: change.position.x,
            positionY: change.position.y,
          })
        }
      })
    },
    [onNodesChange, updateBlock]
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges(eds => addEdge({ ...connection, animated: true }, eds))
    },
    [setEdges]
  )

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectBlock(node.id)
    },
    [selectBlock]
  )

  const onPaneClick = useCallback(() => {
    selectBlock(null)
  }, [selectBlock])

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeStrokeColor={n => getBlockColor(n.data?.block?.type || 'custom')}
          nodeColor={n => getBlockColor(n.data?.block?.type || 'custom')}
          maskColor="rgba(0, 0, 0, 0.8)"
        />
        <Panel position="top-center">
          <CanvasToolbar />
        </Panel>
      </ReactFlow>
    </div>
  )
}
