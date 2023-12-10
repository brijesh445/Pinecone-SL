#include <FreeRTOS.h>
#include <task.h>
#include <stdio.h>

/* Functions required by FreeRTOS */

volatile uint32_t uxTopUsedPriority __attribute__((used)) = configMAX_PRIORITIES - 1;

void vAssertCalled(void)
{
  volatile uint32_t ulSetTo1ToExitFunction = 0;
  
  taskDISABLE_INTERRUPTS();
  
  while(ulSetTo1ToExitFunction != 1) {
    __asm volatile("NOP");
  }
}

void vApplicationGetIdleTaskMemory(StaticTask_t **ppxIdleTaskTCBBuffer, StackType_t **ppxIdleTaskStackBuffer, uint32_t *pulIdleTaskStackSize)
{
  /* if the buffers to be provided to the idle task are declared inside
   * this function then they must be declared static - otherwise they
   * will be allocated on the stack and will be removed after this function exits */
   static StaticTask_t xIdleTaskTCB;
   static StackType_t uxIdleTaskStack[configMINIMAL_STACK_SIZE];
   
   /* pass out a pointer to the StaticTask_t structure in which the state of
    * the idle task will be stored */
    *ppxIdleTaskTCBBuffer = &xIdleTaskTCB;
    
   /* pass out the array that will be used as the stack of the idle task */
   *ppxIdleTaskStackBuffer = uxIdleTaskStack;
   
   /* pass out the size of the array pointed to by *ppxIdleStackBuffer.
    * Note that, as the array is of the type stackType_t, configMINIMAL_STACK_SIZE
    * is specified in words, not bytes */
    *pulIdleTaskStackSize = configMINIMAL_STACK_SIZE;
}

void vApplicationGetTimerTaskMemory(StaticTask_t **ppxTimerTaskTCBBuffer,
  StackType_t **ppxTimerTaskStackBuffer, uint32_t *pulTimerTaskStackSize)
{
  /* if the buffers to be provided to the timer task are declared inside of this
   * function, they must be static - otherwise they will be gone after the function ends */
   static StaticTask_t xTimerTaskTCB;
   static StackType_t uxTimerTaskStack[configTIMER_TASK_STACK_DEPTH];
   
   /* pass out a pointer to the StaticTask_t struct in which the state of
    * the timer will be stored */
    *ppxTimerTaskTCBBuffer = &xTimerTaskTCB;
    
    /* pass out the array that will be used as the timer's stack */
    *ppxTimerTaskStackBuffer = uxTimerTaskStack;
    
    /* pass out the size of the array pointed to by *ppxTimerTaskStackBuffer.
     * note that configTimer_TASK_STACK_DEPTH is specified in words as
     * the array is of the type StackType_t */
    *pulTimerTaskStackSize = configTIMER_TASK_STACK_DEPTH;
}

void vApplicationIdleHook(void)
{
  (void)uxTopUsedPriority;
}

void vApplicationMallocFailedHook(void)
{
  printf("malloc failed, currently left memory in bytes: %d\r\n", xPortGetFreeHeapSize());
  while (1) {}
}

void vApplicationStackOverflowHook(TaskHandle_t xTask, char *pcTaskName)
{
  printf("Stack overflow checked\r\n");
  printf("Task name: %s\r\n", pcTaskName);
  while (1) {}
}
