var socket = new WebSocket("ws://192.168.1.106:81/ws");

socket.onopen = function() {
  console.log("���������� �����������.");
};

socket.onclose = function(event) {
  if (event.wasClean) {
    console.log('���������� ������� �����');
  } else {
    console.log('����� ����������'); // ��������, "����" ������� �������
  }
  console.log('���: ' + event.code + ' �������: ' + event.reason);
};

socket.onmessage = function(event) {
  console.log("�������� ������ " + event.data);
};

socket.onerror = function(error) {
  console.log("������ " + error.message);
};
//////////////////////////////
//socket.send("hi");
//socket.send(33);