export const formatDate = (date: Date) => {
  return date.toLocaleDateString();
};

export const formatValue = (value: any) =>
  value !== null && value !== undefined
    ? value.toLocaleString('pt-br', {
        style: 'currency',
        currency: 'BRL'
      })
    : 'R$ 0,00';

export const formatName = (name: any) =>
  name.length > 0 ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : name;

export const formatCpf = (cpf: any) => {
  return cpf ? cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4') : null;
};
