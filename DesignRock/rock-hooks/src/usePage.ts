import { Beans } from '@grow-admin-rock/middleware-router'
import { diKT } from '@grow-admin-rock/ioc'


/**
 * page switch
 * @see: @grow-admin-rock/middleware-router RouteOperator
 */
export function useGo() {
  return diKT(Beans.RouteOperator).go
}

/**
 * @description: redo current page
 * @see: @grow-admin-rock/middleware-router RouteOperator
 */
export const useRedo = () => {
  return diKT(Beans.RouteOperator).redo
}

/**
 * @description use routetable
 * @returns RouteTable
 */
export const useRouteTable = () => {
  return diKT(Beans.RouteTable)
}
