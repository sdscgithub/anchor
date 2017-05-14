'use strict'

const fp = require('lodash/fp')

function transformContainers (inputValues, inputChart, scope = '') {
  const valuesPrefix = scope ? `.${scope}` : ''
  const values = Object.assign({}, inputValues)
  const chart = Object.assign({}, inputChart)

  chart.spec.containers = chart.spec.containers.map((container) => {
    const containerName = fp.camelCase(container.name)

    values.containers = values.containers || {}
    values.containers[containerName] = values.containers[containerName] || {}
    const containerValues = values.containers[containerName]

    // Image
    const tmp = container.image.split(':')
    const image = tmp[0]
    const imageTag = tmp[1]

    containerValues.image = image
    containerValues.imageTag = imageTag

    container.image = `{{ .Values${valuesPrefix}.containers.${containerName}.image }}:`
       + `{{ .Values${valuesPrefix}.containers.${containerName}.imageTag }}`

    // Environment variables
    if (container.env) {
      container.env = container.env.map((env) => {
        if (!env.value) {
          return env
        }

        containerValues.env = containerValues.env || {}
        containerValues.env[env.name] = env.value

        return Object.assign({}, env, {
          value: `{{ .Values${valuesPrefix}.containers.${containerName}.env.${env.name} }}`
        })
      })
    }

    // Resources
    if (container.resources) {
      if (container.resources.limits) {
        if (container.resources.limits.cpu) {
          containerValues.resourcesLimitsCPU = container.resources.limits.cpu
          container.resources.limits.cpu = `{{ .Values${valuesPrefix}.containers.${containerName}`
            + `.resources.limits.cpu | default ${container.resources.limits.cpu} }}`
        }
        if (container.resources.limits.memory) {
          containerValues.resourcesLimitsMemory = container.resources.limits.memory
          container.resources.limits.memory = `{{ .Values${valuesPrefix}.containers.${containerName}`
            + `.resources.limits.memory | default ${container.resources.limits.memory} }}`
        }
      }

      if (container.resources.requests) {
        if (container.resources.requests.cpu) {
          containerValues.resourcesRequestsCPU = container.resources.requests.cpu
          container.resources.requests.cpu = `{{ .Values${valuesPrefix}.containers.${containerName}`
            + `.resources.requests.cpu | default ${container.resources.requests.cpu} }}`
        }
        if (container.resources.requests.memory) {
          containerValues.resourcesRequestsMemory = container.resources.requests.memory
          container.resources.requests.memory = `{{ .Values${valuesPrefix}.containers.${containerName}`
            + `.resources.requests.memory | default ${container.resources.requests.memory} }}`
        }
      }
    }

    return container
  })

  return {
    values,
    chart
  }
}

function transform (inputValues, inputChart, scope = '') {
  const containers = transformContainers(inputValues, inputChart, scope)
  const values = Object.assign({}, containers.values)
  const chart = Object.assign({}, containers.chart)

  return {
    values,
    chart
  }
}

module.exports = transform